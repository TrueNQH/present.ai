import type { TDescendant, TElement, TText } from "@udecode/plate-common";
import { ColumnItemPlugin, ColumnPlugin } from "@udecode/plate-layout/react";
import { nanoid } from "nanoid"; // Import nanoid for unique ID generation

// Define a text node with generating property
export interface GeneratingText extends TText {
  text: string;
  generating?: boolean;
}

// Plate element types
export type ParagraphElement = TElement & { type: "p" };
export type HeadingElement = TElement & {
  type: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
};
export type ImageElement = TElement & {
  type: "img";
  url: string;
  query: string;
};
export type ColumnItemElement = TElement & {
  type: typeof ColumnItemPlugin.key;
};
export type ColumnsElement = TElement & { type: typeof ColumnPlugin.key };
export type BulletElement = TElement & { type: "bullet" };
export type BulletsElement = TElement & { type: "bullets" };
export type IconElement = TElement & {
  type: "icon";
  query: string;
  name: string; // We'll keep this but use an empty string
};
export type IconItemElement = TElement & { type: "icon-item" };
export type IconsElement = TElement & { type: "icons" };
export type CycleItemElement = TElement & { type: "cycle-item" };
export type CycleElement = TElement & { type: "cycle" };
export type StairItemElement = TElement & { type: "stair-item" };
export type StaircaseElement = TElement & { type: "staircase" };
export type ChartElement = TElement & {
  type: "chart";
  chartType: string;
  data: Array<{ label: string; value: number }>;
};
export type VisualizationItemElement = TElement & {
  type: "visualization-item";
};
export type VisualizationListElement = TElement & {
  type: "visualization-list";
  visualizationType: "pyramid" | "arrow" | "timeline";
};

// Union type for all possible Plate elements
export type PlateNode =
  | ParagraphElement
  | HeadingElement
  | ImageElement
  | ColumnItemElement
  | ColumnsElement
  | BulletElement
  | BulletsElement
  | IconElement
  | IconItemElement
  | IconsElement
  | CycleItemElement
  | CycleElement
  | StairItemElement
  | StaircaseElement
  | ChartElement
  | VisualizationItemElement
  | VisualizationListElement;

export type LayoutType = "left" | "right" | "vertical";
// Updated slide type to be a structured object instead of just an array
export type PlateSlide = {
  id: string;
  content: PlateNode[];
  rootImage?: {
    query: string;
    url?: string;
  };
  layoutType?: LayoutType | undefined;
  alignment?: "start" | "center" | "end";
  bgColor?: string;
  width?: "L" | "M";
};

// Simple XML node interface for our parser
interface XMLNode {
  tag: string;
  attributes: Record<string, string>;
  content: string;
  children: XMLNode[];
  originalTagContent?: string; // Added to store the original tag content for validation
}

/**
 * Class to parse XML presentation data into Plate.js format with improved streaming support
 */
export class SlideParser {
  private buffer = "";
  private completedSections: string[] = [];
  private parsedSlides: PlateSlide[] = [];

  // Track the total processed content to avoid reprocessing
  private totalProcessedLength = 0;
  private lastInputLength = 0;

  // Map to store section identifiers to slide IDs to maintain consistency
  private sectionIdMap = new Map<string, string>();

  // Keep track of the latest content for generating mark
  private lastTextContent = "";
  private latestContent = "";

  /**
   * Parse a chunk of XML data
   * @param chunk XML data chunk (can include previously seen data)
   * @returns Newly parsed slides if any
   */
  public parseChunk(chunk: string): PlateSlide[] {
    // For generating mark tracking, store the latest content
    this.latestContent = chunk;

    // Check if this is a completely new chunk or includes previous data
    const isFullContent =
      chunk.length >= this.lastInputLength &&
      chunk.substring(0, this.lastInputLength) ===
        this.buffer.substring(0, this.lastInputLength);

    // If we're getting the full content (previous + new),
    // we only want to process what's new
    if (isFullContent && this.lastInputLength > 0) {
      // Only add the new part to our buffer
      this.buffer = this.buffer + chunk.substring(this.lastInputLength);
    } else {
      // This is a new, unrelated chunk - reset and process from scratch
      this.buffer = chunk;
    }

    // Update the tracking of our input size
    this.lastInputLength = chunk.length;

    // Extract complete sections
    this.extractCompleteSections();

    // Process completed sections
    const newSlides = this.processSections();

    // Find the last text content for tracking the generating mark
    this.lastTextContent = this.findLastTextContent(chunk);

    return newSlides;
  }

  /**
   * Find the last text content that is not within a tag
   * This is used to identify what content should have the generating mark
   */
  private findLastTextContent(xml: string): string {
    // Extract the last bit of content
    const lastTagIndex = xml.lastIndexOf("<");
    if (lastTagIndex === -1) return xml;

    // Find the last closing tag
    const lastClosingTagIndex = xml.lastIndexOf(">");

    // If we have text after the last tag, that's what's being generated
    if (lastClosingTagIndex > lastTagIndex) {
      return "";
    }

    return xml.substring(lastTagIndex);
  }

  /**
   * Finalize parsing with any remaining content
   * @returns Final parsed slides if any
   */
  public finalize(): PlateSlide[] {
    try {
      // Extract any complete sections first
      this.extractCompleteSections();

      // Check if we still have a partial section
      let remainingBuffer = this.buffer.trim();

      // Skip PRESENTATION tag if present
      if (remainingBuffer.startsWith("<PRESENTATION")) {
        const tagEndIdx = remainingBuffer.indexOf(">");
        if (tagEndIdx !== -1) {
          remainingBuffer = remainingBuffer.substring(tagEndIdx + 1).trim();
        }
      }

      if (remainingBuffer.startsWith("<SECTION")) {
        // We have an incomplete section, force close it
        const fixedSection = remainingBuffer + "</SECTION>";
        this.completedSections.push(fixedSection);
      }

      // Process all sections
      const finalSlides = this.processSections();

      // Clear the generating mark tracking for completed content
      this.lastTextContent = "";
      this.latestContent = "";

      return finalSlides;
    } catch (e) {
      console.error("Error during finalization:", e);
      return [];
    }
  }

  /**
   * Get all parsed slides
   */
  public getAllSlides(): PlateSlide[] {
    return this.parsedSlides;
  }

  /**
   * Reset the parser state
   */
  public reset(): void {
    this.buffer = "";
    this.completedSections = [];
    this.parsedSlides = [];
    this.totalProcessedLength = 0;
    this.lastInputLength = 0;
    this.lastTextContent = "";
    this.latestContent = "";
    // Don't reset sectionIdMap to maintain IDs across reset calls
  }

  /**
   * Manually clear all generating marks from all slides
   * Call this when presentation generation is complete
   */
  public clearAllGeneratingMarks(): void {
    // Clear marks from all slides
    for (const slide of this.parsedSlides) {
      this.clearGeneratingMarksFromNodes(slide.content as TDescendant[]);
    }

    // Clear tracking state
    this.lastTextContent = "";
    this.latestContent = "";
  }

  /**
   * Clear all generating marks from a tree of nodes
   */
  private clearGeneratingMarksFromNodes(nodes: TDescendant[]): void {
    for (const node of nodes) {
      if ("text" in node && (node as GeneratingText).generating !== undefined) {
        (node as GeneratingText).generating = undefined;
      }

      if (
        "children" in node &&
        Array.isArray(node.children) &&
        node.children.length > 0
      ) {
        this.clearGeneratingMarksFromNodes(node.children as TDescendant[]);
      }
    }
  }

  /**
   * Process the completed sections into Plate slides
   */
  private processSections(): PlateSlide[] {
    if (this.completedSections.length === 0) {
      return [];
    }

    const newSlides = this.completedSections.map(this.convertSectionToPlate);
    this.parsedSlides = [...this.parsedSlides, ...newSlides];
    this.completedSections = [];

    return newSlides;
  }

  /**
   * Extract SECTION blocks from the buffer, handling incomplete tags
   * and PRESENTATION wrapper tag
   */
  private extractCompleteSections(): void {
    let startIdx = 0;
    let extractedSectionEndIdx = 0;

    // Handle potential PRESENTATION wrapper tag - skip it
    const presentationStartIdx = this.buffer.indexOf("<PRESENTATION");
    if (presentationStartIdx !== -1 && presentationStartIdx < 10) {
      // Found PRESENTATION tag at the beginning, find the end of the opening tag
      const tagEndIdx = this.buffer.indexOf(">", presentationStartIdx);
      if (tagEndIdx !== -1) {
        // Skip past the full opening tag including any attributes
        startIdx = tagEndIdx + 1;

        // Also skip any comments after the PRESENTATION tag
        const commentStartIdx = this.buffer.indexOf("<!--", startIdx);
        if (commentStartIdx !== -1 && commentStartIdx < startIdx + 20) {
          const commentEndIdx = this.buffer.indexOf("-->", commentStartIdx);
          if (commentEndIdx !== -1) {
            startIdx = commentEndIdx + 3;
          }
        }
      }
    }

    while (true) {
      // Find the next SECTION start tag
      const sectionStartIdx = this.buffer.indexOf("<SECTION", startIdx);
      if (sectionStartIdx === -1) break;

      // Find the corresponding end tag, or another SECTION start
      const sectionEndIdx = this.buffer.indexOf("</SECTION>", sectionStartIdx);
      const nextSectionIdx = this.buffer.indexOf(
        "<SECTION",
        sectionStartIdx + 1
      );

      // If we found a complete section with proper ending
      if (
        sectionEndIdx !== -1 &&
        (nextSectionIdx === -1 || sectionEndIdx < nextSectionIdx)
      ) {
        // Extract the complete section
        const completeSection = this.buffer.substring(
          sectionStartIdx,
          sectionEndIdx + "</SECTION>".length
        );

        this.completedSections.push(completeSection);
        startIdx = sectionEndIdx + "</SECTION>".length;
        extractedSectionEndIdx = startIdx;
      }
      // If we found another SECTION starting before this one ends
      else if (nextSectionIdx !== -1) {
        // Force close the current section
        const partialSection = this.buffer.substring(
          sectionStartIdx,
          nextSectionIdx
        );

        // Check if it has actual content
        if (
          partialSection.includes("<H1>") ||
          partialSection.includes("<H2>") ||
          partialSection.includes("<H3>") ||
          partialSection.includes("<PYRAMID>") ||
          partialSection.includes("<ARROWS>") ||
          partialSection.includes("<TIMELINE>")
        ) {
          // Add a closing tag and process it
          this.completedSections.push(partialSection + "</SECTION>");
        }

        startIdx = nextSectionIdx;
        extractedSectionEndIdx = nextSectionIdx;
      }
      // If this is the last section in the buffer and it's still incomplete
      else {
        // We'll wait for more data or handle in finalize()
        break;
      }
    }

    // Update buffer to remove processed sections
    if (extractedSectionEndIdx > 0) {
      this.buffer = this.buffer.substring(extractedSectionEndIdx);
    }
  }

  /**
   * Generate a section identifier to track the same section across updates
   * This helps maintain the same ID when the section is updated
   */
  private generateSectionIdentifier(sectionNode: XMLNode): string {
    // Try to find a unique heading to identify the section
    const h1Node = sectionNode.children.find(
      (child) => child.tag.toUpperCase() === "H1"
    );

    // Use H1 content as a primary identifier if available
    if (h1Node) {
      const headingContent = this.getTextContent(h1Node);
      if (headingContent.trim().length > 0) {
        return `heading-${headingContent.trim()}`;
      }
    }

    // No reliable heading found, use a combination of the first few child elements
    // and any section attributes to create a fingerprint
    let fingerprint = "";

    // Add section attributes
    const attrKeys = Object.keys(sectionNode.attributes).sort();
    if (attrKeys.length > 0) {
      fingerprint += attrKeys
        .map((key) => `${key}=${sectionNode.attributes[key]}`)
        .join(";");
    }

    // Add first few child element tags
    const childTags = sectionNode.children
      .slice(0, 3)
      .map((child) => child.tag.toUpperCase());
    if (childTags.length > 0) {
      fingerprint += "|" + childTags.join("-");
    }

    // If we still don't have a usable fingerprint, use the full section content hash
    // This is less stable for updates but better than nothing
    if (fingerprint.length < 5) {
      // Simple string hash function
      let hash = 0;
      const fullContent = sectionNode.originalTagContent ?? "";
      for (let i = 0; i < fullContent.length; i++) {
        const char = fullContent.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash = hash & hash; // Convert to 32bit integer
      }
      fingerprint = `content-hash-${Math.abs(hash)}`;
    }

    return fingerprint;
  }

  /**
   * Convert an XML section string to Plate.js format
   * Modified to extract root-level images and layout type
   */
  private convertSectionToPlate = (sectionString: string): PlateSlide => {
    // Parse XML string into a structured XMLNode tree
    const rootNode = this.parseXML(sectionString);

    // Find the SECTION node (should be the first child of ROOT)
    const sectionNode = rootNode.children.find(
      (child) => child.tag.toUpperCase() === "SECTION"
    );

    if (!sectionNode) {
      console.error("No SECTION element found in the XML");
      return {
        id: nanoid(),
        content: [],
        layoutType: undefined,
        alignment: "center",
      }; // Return empty content object with a new ID if no section found
    }

    // Generate a section identifier to check if we've seen this section before
    const sectionIdentifier = this.generateSectionIdentifier(sectionNode);

    // Check if we already have an ID for this section
    let slideId: string;
    if (this.sectionIdMap.has(sectionIdentifier)) {
      // Use the existing ID for consistency
      slideId = this.sectionIdMap.get(sectionIdentifier)!;
    } else {
      // Generate a new ID using nanoid
      slideId = nanoid();
      // Store it for future reference
      this.sectionIdMap.set(sectionIdentifier, slideId);
    }

    // Extract layout type from SECTION attributes
    let layoutType: LayoutType | undefined = undefined;
    const layoutAttr = sectionNode.attributes.layout;

    if (layoutAttr) {
      // Validate that the layout attribute is one of our allowed values
      if (
        layoutAttr === "left" ||
        layoutAttr === "right" ||
        layoutAttr === "vertical"
      ) {
        layoutType = layoutAttr as LayoutType;
      } else {
        // Default to "left" if we get an invalid layout value
        console.warn(
          `Invalid layout type "${layoutAttr}", defaulting to "left"`
        );
        layoutType = "left";
      }
    }

    // Process each child of SECTION as a separate top-level element
    const plateElements: PlateNode[] = [];
    let rootImage: { query: string; url?: string } | undefined = undefined;

    for (const child of sectionNode.children) {
      // Check if this is a root-level IMG
      if (child.tag.toUpperCase() === "IMG") {
        // Only process if we have the complete original tag content
        if (child.originalTagContent) {
          const url = child.attributes.url ?? child.attributes.src ?? "";

          // Check for complete quotes in the query attribute
          const queryStart = child.originalTagContent.indexOf("query=");
          let isCompleteQuery = false;

          if (queryStart !== -1) {
            const afterQuery = child.originalTagContent.substring(
              queryStart + 6
            );
            if (afterQuery.length > 0) {
              const quoteChar = afterQuery[0];
              if (quoteChar === '"' || quoteChar === "'") {
                // Find the matching closing quote
                const closingQuoteIdx = afterQuery.indexOf(quoteChar, 1);

                // Only consider the query complete if it has a closing quote
                isCompleteQuery = closingQuoteIdx !== -1;

                // If complete, extract the actual query content
                if (isCompleteQuery) {
                  const extractedQuery = afterQuery.substring(
                    1,
                    closingQuoteIdx
                  );

                  // Only set rootImage if the query is valid and we don't already have one
                  if (
                    extractedQuery &&
                    extractedQuery.trim().length > 0 &&
                    !rootImage
                  ) {
                    rootImage = {
                      query: extractedQuery,
                      ...(url ? { url } : {}),
                    };
                  }
                }
              }
            }
          }
        }
        // Skip adding this to plateElements since we're treating it specially
        continue;
      }

      // FIXED: Special handling for top-level DIV elements
      if (child.tag.toUpperCase() === "DIV") {
        // Process each child of the DIV as a top-level element
        for (const divChild of child.children) {
          const processedElement = this.processTopLevelNode(divChild);
          if (processedElement) {
            plateElements.push(processedElement);
          }
        }
      } else {
        // Process non-DIV elements as before
        const processedElement = this.processTopLevelNode(child);
        if (processedElement) {
          plateElements.push(processedElement);
        }
      }
    }

    // Return the new structured PlateSlide object with the ID
    return {
      id: slideId, // Use the consistent ID
      content: plateElements,
      ...(rootImage ? { rootImage } : {}),
      ...(layoutType ? { layoutType: layoutType } : {}),
      alignment: "center",
    };
  };

  /**
   * Process a top-level node in the SECTION
   */
  private processTopLevelNode(node: XMLNode): PlateNode | null {
    const tag = node.tag.toUpperCase();

    // Handle each possible top-level element type
    switch (tag) {
      case "H1":
      case "H2":
      case "H3":
      case "H4":
      case "H5":
      case "H6":
        return this.createHeading(
          tag.toLowerCase() as "h1" | "h2" | "h3" | "h4" | "h5" | "h6",
          node
        );

      case "P":
        return this.createParagraph(node);

      case "IMG":
        return this.createImage(node);

      case "COLUMNS":
        return this.createColumns(node);

      case "BULLETS":
        return this.createBullets(node);

      case "ICONS":
        return this.createIcons(node);

      case "CYCLE":
        return this.createCycle(node);

      case "STAIRCASE":
        return this.createStaircase(node);

      case "CHART":
        return this.createChart(node);

      // Handle all visualization types with a single function
      case "ARROWS":
        return this.createVisualization(node, "arrow");

      case "PYRAMID":
        return this.createVisualization(node, "pyramid");

      case "TIMELINE":
        return this.createVisualization(node, "timeline");

      default:
        console.warn(`Unknown top-level tag: ${tag}`);
        return null;
    }
  }

  /**
   * Parse XML string into a structured tree of XMLNodes
   * with improved handling for malformed or streaming XML
   * and PRESENTATION wrapper tag
   */
  private parseXML(xmlString: string): XMLNode {
    // Create a root node to hold all parsed content
    const rootNode: XMLNode = {
      tag: "ROOT",
      attributes: {},
      content: "",
      children: [],
    };

    // Handle PRESENTATION wrapper tag by removing it if present
    let processedXml = xmlString;

    // Handle opening tag with possible attributes
    const presentationOpenStart = processedXml.indexOf("<PRESENTATION");
    if (presentationOpenStart !== -1) {
      const presentationOpenEnd = processedXml.indexOf(
        ">",
        presentationOpenStart
      );
      if (presentationOpenEnd !== -1) {
        // Remove the entire opening tag including attributes
        processedXml =
          processedXml.substring(0, presentationOpenStart) +
          processedXml.substring(presentationOpenEnd + 1);
      }
    }

    // Handle closing tag
    processedXml = processedXml.replace("</PRESENTATION>", "");

    try {
      // Add simple recovery - force close any unclosed tags
      let fixedXml = processedXml;

      // If there's no </SECTION> at the end but there is a <SECTION>, add one
      if (fixedXml.includes("<SECTION") && !fixedXml.endsWith("</SECTION>")) {
        fixedXml += "</SECTION>";
      }

      // Manually parse the XML
      this.parseElement(fixedXml, rootNode);
    } catch (error) {
      console.error("Error parsing XML:", error);

      // Fall back to a very basic parser that just captures top level tags
      // First remove the PRESENTATION tags if present
      let withoutPresentation = xmlString;

      // Handle opening tag with possible attributes
      const presentationOpenStart =
        withoutPresentation.indexOf("<PRESENTATION");
      if (presentationOpenStart !== -1) {
        const presentationOpenEnd = withoutPresentation.indexOf(
          ">",
          presentationOpenStart
        );
        if (presentationOpenEnd !== -1) {
          // Remove the entire opening tag including attributes
          withoutPresentation =
            withoutPresentation.substring(0, presentationOpenStart) +
            withoutPresentation.substring(presentationOpenEnd + 1);
        }
      }

      // Handle closing tag
      withoutPresentation = withoutPresentation.replace("</PRESENTATION>", "");

      const sections = withoutPresentation.split(/<\/?SECTION[^>]*>/);
      let inSection = false;

      for (const section of sections) {
        if (inSection && section.trim()) {
          // Create a synthetic section
          const sectionNode: XMLNode = {
            tag: "SECTION",
            attributes: {},
            content: "",
            children: [],
          };

          // Just capture the raw content
          sectionNode.content = section.trim();
          rootNode.children.push(sectionNode);
        }
        inSection = !inSection;
      }
    }

    return rootNode;
  }

  /**
   * Simple parser that works with incomplete tags
   */
  private parseElement(xml: string, parentNode: XMLNode): void {
    let currentIndex = 0;

    while (currentIndex < xml.length) {
      // Find next tag
      const tagStart = xml.indexOf("<", currentIndex);

      // No more tags, add remaining text as content
      if (tagStart === -1) {
        parentNode.content += xml.substring(currentIndex);
        break;
      }

      // Add text before tag as content
      if (tagStart > currentIndex) {
        parentNode.content += xml.substring(currentIndex, tagStart);
      }

      // Find end of tag
      const tagEnd = xml.indexOf(">", tagStart);

      // Incomplete tag, treat as text
      if (tagEnd === -1) {
        parentNode.content += xml.substring(tagStart);
        break;
      }

      // Extract tag content
      const tagContent = xml.substring(tagStart + 1, tagEnd);

      // Check if this is a closing tag for the current node
      if (tagContent.startsWith("/")) {
        const closingTag = tagContent.substring(1);

        if (closingTag.toUpperCase() === parentNode.tag.toUpperCase()) {
          // This is our closing tag, we're done with this node
          currentIndex = tagEnd + 1;
          break;
        } else {
          // This is a closing tag for something else, skip it
          currentIndex = tagEnd + 1;
          continue;
        }
      }

      // Skip comments
      if (tagContent.startsWith("!--")) {
        const commentEnd = xml.indexOf("-->", tagStart);
        currentIndex = commentEnd !== -1 ? commentEnd + 3 : xml.length;
        continue;
      }

      // Parse tag name and attributes
      let tagName: string;
      let attrString: string;

      const firstSpace = tagContent.indexOf(" ");
      if (firstSpace === -1) {
        tagName = tagContent;
        attrString = "";
      } else {
        tagName = tagContent.substring(0, firstSpace);
        attrString = tagContent.substring(firstSpace + 1);
      }

      // Skip special tags
      if (tagName.startsWith("!") || tagName.startsWith("?")) {
        currentIndex = tagEnd + 1;
        continue;
      }

      // Check if this is a self-closing tag
      const isSelfClosing = tagContent.endsWith("/");
      if (isSelfClosing) {
        tagName = tagName.replace(/\/$/, "");
      }

      // Parse attributes
      const attributes: Record<string, string> = {};
      let attrRemaining = attrString.trim();

      while (attrRemaining.length > 0) {
        // Find next attribute name
        const eqIndex = attrRemaining.indexOf("=");
        if (eqIndex === -1) {
          // No more attributes with values
          break;
        }

        const attrName = attrRemaining.substring(0, eqIndex).trim();
        attrRemaining = attrRemaining.substring(eqIndex + 1).trim();

        // Parse attribute value
        let attrValue = "";
        const quoteChar = attrRemaining.charAt(0);

        if (quoteChar === '"' || quoteChar === "'") {
          // Find matching end quote
          const endQuoteIndex = attrRemaining.indexOf(quoteChar, 1);

          if (endQuoteIndex !== -1) {
            attrValue = attrRemaining.substring(1, endQuoteIndex);
            attrRemaining = attrRemaining.substring(endQuoteIndex + 1).trim();
          } else {
            // Unclosed quote, take the rest
            attrValue = attrRemaining.substring(1);
            attrRemaining = "";
          }
        } else {
          // No quotes, take until next space
          const nextSpaceIndex = attrRemaining.indexOf(" ");

          if (nextSpaceIndex !== -1) {
            attrValue = attrRemaining.substring(0, nextSpaceIndex);
            attrRemaining = attrRemaining.substring(nextSpaceIndex + 1).trim();
          } else {
            attrValue = attrRemaining;
            attrRemaining = "";
          }
        }

        attributes[attrName] = attrValue;
      }

      // Create new node
      const newNode: XMLNode = {
        tag: tagName,
        attributes,
        content: "",
        children: [],
        originalTagContent: xml.substring(tagStart, tagEnd + 1),
      };

      // Add to parent's children
      parentNode.children.push(newNode);

      // Move past this tag
      currentIndex = tagEnd + 1;

      // If not self-closing, recursively parse its content
      if (!isSelfClosing) {
        // Recursively parse child content
        this.parseElement(xml.substring(currentIndex), newNode);

        // Skip past the child content (look for the closing tag)
        const closingTag = `</${tagName}>`;
        const closingTagIndex = xml.indexOf(closingTag, currentIndex);

        if (closingTagIndex !== -1) {
          currentIndex = closingTagIndex + closingTag.length;
        } else {
          // No closing tag found, assume the rest belongs to this tag
          // but don't consume it - let the parent node handle it
          break;
        }
      }
    }
  }

  /**
   * Check if the given content should have generating mark
   * This is a simpler approach - if the text appears at the end of the
   * latest XML content and isn't followed by a closing tag, it's being generated
   */
  private shouldHaveGeneratingMark(text: string): boolean {
    // Trim the text for consistent comparison
    const trimmedText = text.trim();
    if (!trimmedText) return false;

    // Check if this text appears at the end of the latest content
    const textPos = this.latestContent.lastIndexOf(trimmedText);
    if (textPos === -1) return false;

    // If this text is at the very end of the content, it's being generated
    const textEnd = textPos + trimmedText.length;
    if (textEnd >= this.latestContent.length) return true;

    // If the text is followed by a tag, it's not being generated
    const afterText = this.latestContent.substring(textEnd).trim();
    return !afterText.startsWith("<");
  }

  /**
   * Create a heading element
   */
  private createHeading(
    level: "h1" | "h2" | "h3" | "h4" | "h5" | "h6",
    node: XMLNode
  ): HeadingElement {
    return {
      type: level,
      children: this.getTextDescendants(node),
    } as HeadingElement;
  }

  /**
   * Create a paragraph element
   */
  private createParagraph(node: XMLNode): ParagraphElement {
    return {
      type: "p",
      children: this.getTextDescendants(node),
    } as ParagraphElement;
  }

  /**
   * Helper function to validate if a query is complete and valid
   */
  private isValidQuery(query: string, originalTagContent?: string): boolean {
    if (!query) return false;

    // Clean query by removing any XML tags
    let cleanedQuery = query;

    // If query contains XML fragments, clean or truncate it
    if (
      cleanedQuery.includes("<") ||
      cleanedQuery.includes(">") ||
      cleanedQuery.includes("</") ||
      cleanedQuery.includes("/>") ||
      cleanedQuery.includes("SECTION")
    ) {
      // For ICON tags, try to clean the query instead of rejecting it
      const tagIndex = Math.min(
        cleanedQuery.includes("<") ? cleanedQuery.indexOf("<") : Infinity,
        cleanedQuery.includes(">") ? cleanedQuery.indexOf(">") : Infinity,
        cleanedQuery.includes("</") ? cleanedQuery.indexOf("</") : Infinity,
        cleanedQuery.includes("/>") ? cleanedQuery.indexOf("/>") : Infinity,
        cleanedQuery.includes("SECTION")
          ? cleanedQuery.indexOf("SECTION")
          : Infinity
      );

      cleanedQuery = cleanedQuery.substring(0, tagIndex).trim();

      // If after cleaning, the query is too short, reject it
      if (cleanedQuery.length < 3) {
        return false;
      }
    }

    // Check if the tag has proper quotes around the query attribute
    if (originalTagContent) {
      const queryStart = originalTagContent.indexOf("query=");
      if (queryStart !== -1) {
        const afterQuery = originalTagContent.substring(queryStart + 6);
        if (afterQuery.length > 0) {
          const quoteChar = afterQuery[0];
          if (
            (quoteChar === '"' || quoteChar === "'") &&
            !afterQuery.includes(quoteChar, 1)
          ) {
            // Found opening quote but no closing quote - incomplete
            return false;
          }
        }
      }
    }

    // Special handling for obviously incomplete queries
    if (
      cleanedQuery.length < 3 ||
      cleanedQuery.endsWith("...") ||
      cleanedQuery.endsWith(",") ||
      !cleanedQuery.trim()
    ) {
      return false;
    }

    return true;
  }

  /**
   * Create an image element with strict validation for complete queries
   */
  private createImage(node: XMLNode): ImageElement | null {
    // Only process if we have the complete original tag content
    if (!node.originalTagContent) {
      return null;
    }

    const url = node.attributes.url ?? node.attributes.src ?? "";

    // Check for complete quotes in the query attribute
    const queryStart = node.originalTagContent.indexOf("query=");

    if (queryStart === -1) {
      return null;
    }

    const afterQuery = node.originalTagContent.substring(queryStart + 6);
    if (afterQuery.length === 0) {
      return null;
    }

    const quoteChar = afterQuery[0];
    if (quoteChar !== '"' && quoteChar !== "'") {
      return null;
    }

    // Find the matching closing quote
    const closingQuoteIdx = afterQuery.indexOf(quoteChar, 1);

    // Only create image if query has a closing quote
    if (closingQuoteIdx === -1) {
      return null;
    }

    // Extract the actual query content between the quotes
    const query = afterQuery.substring(1, closingQuoteIdx);

    // Basic validation on the query content
    if (!query || query.trim().length < 3) {
      return null;
    }

    // Query is valid and complete, create the image element
    return {
      type: "img",
      url: url,
      query: query,
      children: [{ text: "" } as TText],
    } as ImageElement;
  }

  /**
   * Create a columns layout element
   */
  private createColumns(node: XMLNode): ColumnsElement {
    const columnItems: ColumnItemElement[] = [];

    // Process DIV children as column items
    for (const child of node.children) {
      if (child.tag.toUpperCase() === "DIV") {
        const columnItem: ColumnItemElement = {
          type: ColumnItemPlugin.key,
          children: this.processNodes(child.children) as TDescendant[],
        };
        columnItems.push(columnItem);
      }
    }

    return {
      type: ColumnPlugin.key,
      children: columnItems,
    } as ColumnsElement;
  }

  /**
   * Process a DIV node, returning its contents
   */
  private processDiv(node: XMLNode): PlateNode | null {
    // Process all children and return as appropriate structure
    const children = this.processNodes(node.children);

    const nodeContent = node.content.trim();

    if (children.length === 0) {
      // If no children, create a paragraph with the text content
      return {
        type: "p",
        children: [
          {
            text: nodeContent,
            // Add generating mark if this text is at the end of the buffer
            ...(this.shouldHaveGeneratingMark(nodeContent)
              ? { generating: true }
              : {}),
          } as TText,
        ],
      } as ParagraphElement;
    } else if (children.length === 1) {
      // If only one child, return it directly
      return children[0] ?? null;
    } else {
      // If multiple children, wrap in a paragraph
      return {
        type: "p",
        children: children as TDescendant[],
      } as ParagraphElement;
    }
  }

  /**
   * Create a bullets layout element
   */
  private createBullets(node: XMLNode): BulletsElement {
    const bulletItems: BulletElement[] = [];

    // Process DIV children as bullet items
    for (const child of node.children) {
      if (child.tag.toUpperCase() === "DIV") {
        const bulletItem: BulletElement = {
          type: "bullet",
          children: this.processNodes(child.children) as TDescendant[],
        };
        bulletItems.push(bulletItem);
      }
    }

    return {
      type: "bullets",
      children: bulletItems,
    } as BulletsElement;
  }

  /**
   * Create an icons layout element
   */
  private createIcons(node: XMLNode): IconsElement {
    const iconItems: IconItemElement[] = [];

    // Process DIV children as icon items
    for (const child of node.children) {
      if (child.tag.toUpperCase() === "DIV") {
        // Look for icon name in ICON child
        let query = "";
        const children: TDescendant[] = [];

        for (const iconChild of child.children) {
          if (iconChild.tag.toUpperCase() === "ICON") {
            // Get the query attribute
            let rawQuery = iconChild.attributes.query ?? "";

            // Clean query by removing any XML fragments
            if (
              rawQuery.includes("<") ||
              rawQuery.includes(">") ||
              rawQuery.includes("</") ||
              rawQuery.includes("SECTION")
            ) {
              const tagIndex = Math.min(
                rawQuery.includes("<") ? rawQuery.indexOf("<") : Infinity,
                rawQuery.includes(">") ? rawQuery.indexOf(">") : Infinity,
                rawQuery.includes("</") ? rawQuery.indexOf("</") : Infinity,
                rawQuery.includes("SECTION")
                  ? rawQuery.indexOf("SECTION")
                  : Infinity
              );

              rawQuery = rawQuery.substring(0, tagIndex).trim();
            }

            // Accept even single-word icon queries as they are often just one word
            if (rawQuery && rawQuery.trim().length >= 2) {
              query = rawQuery.trim();
            }
          } else {
            const processedChild = this.processNode(iconChild);
            if (processedChild) {
              children.push(processedChild as TDescendant);
            }
          }
        }

        // Add icon element if found - with empty name property
        if (query) {
          children.unshift({
            type: "icon",
            query: query,
            children: [{ text: "" } as TText],
          } as IconElement);
        }

        const iconItem: IconItemElement = {
          type: "icon-item",
          children,
        };
        iconItems.push(iconItem);
      }
    }

    return {
      type: "icons",
      children: iconItems,
    } as IconsElement;
  }

  /**
   * Create a cycle layout element
   */
  private createCycle(node: XMLNode): CycleElement {
    const cycleItems: CycleItemElement[] = [];

    // Process DIV children as cycle items
    for (const child of node.children) {
      if (child.tag.toUpperCase() === "DIV") {
        const cycleItem: CycleItemElement = {
          type: "cycle-item",
          children: this.processNodes(child.children) as TDescendant[],
        };
        cycleItems.push(cycleItem);
      }
    }

    return {
      type: "cycle",
      children: cycleItems,
    } as CycleElement;
  }

  /**
   * Create a staircase layout element
   */
  private createStaircase(node: XMLNode): StaircaseElement {
    const stairItems: StairItemElement[] = [];

    // Process DIV children as stair items
    for (const child of node.children) {
      if (child.tag.toUpperCase() === "DIV") {
        const stairItem: StairItemElement = {
          type: "stair-item",
          children: this.processNodes(child.children) as TDescendant[],
        };
        stairItems.push(stairItem);
      }
    }

    return {
      type: "staircase",
      children: stairItems,
    } as StaircaseElement;
  }

  /**
   * Create a chart element
   */
  private createChart(node: XMLNode): ChartElement {
    // Extract chart type from attributes
    const chartType = node.attributes.charttype ?? "horizontal-bar";

    // Find TABLE child
    const tableNode = node.children.find(
      (child) => child.tag.toUpperCase() === "TABLE"
    );

    // Parse chart data from TR rows
    const chartData: Array<{ label: string; value: number }> = [];

    if (tableNode) {
      // Find TR children
      const trNodes = tableNode.children.filter(
        (child) => child.tag.toUpperCase() === "TR"
      );

      for (const trNode of trNodes) {
        // Find TD children
        const tdNodes = trNode.children.filter(
          (child) => child.tag.toUpperCase() === "TD"
        );

        let label = "";
        let value = 0;

        // Extract label and value from TD nodes
        for (const tdNode of tdNodes) {
          const tdType = tdNode.attributes.type ?? "";

          // Find VALUE child
          const valueNode = tdNode.children.find(
            (child) => child.tag.toUpperCase() === "VALUE"
          );

          if (valueNode) {
            if (tdType === "label") {
              label = valueNode.content.trim();
            } else if (tdType === "data") {
              value = parseFloat(valueNode.content.trim()) || 0;
            }
          }
        }

        chartData.push({ label, value });
      }
    }

    return {
      type: "chart",
      chartType,
      data: chartData,
      children: [{ text: "" } as TText],
    } as ChartElement;
  }

  /**
   * Create a visualization list element (handles arrows, pyramid, timeline)
   */
  private createVisualization(
    node: XMLNode,
    visualizationType: "arrow" | "pyramid" | "timeline"
  ): VisualizationListElement {
    // Process DIV children as visualization items
    const visualizationItems: VisualizationItemElement[] = [];

    // Process DIV children
    for (const child of node.children) {
      if (child.tag.toUpperCase() === "DIV") {
        // Process all elements inside the DIV
        const itemChildren: TDescendant[] = [];

        for (const divChild of child.children) {
          const processedChild = this.processNode(divChild);
          if (processedChild) {
            itemChildren.push(processedChild as TDescendant);
          }
        }

        // If no children were processed but we have text content, add it
        if (itemChildren.length === 0 && child.content.trim()) {
          const contentText = child.content.trim();
          itemChildren.push({
            text: contentText,
            // Add generating mark if this is at the end of the buffer
            ...(this.shouldHaveGeneratingMark(contentText)
              ? { generating: true }
              : {}),
          } as TText);
        }

        // Create a visualization-item element
        if (itemChildren.length > 0) {
          visualizationItems.push({
            type: "visualization-item",
            children: itemChildren,
          } as VisualizationItemElement);
        }
      }
    }

    return {
      type: "visualization-list",
      visualizationType,
      children:
        visualizationItems.length > 0
          ? visualizationItems
          : [{ text: "" } as TText],
    } as VisualizationListElement;
  }

  /**
   * Extract text descendants from a node, processing child nodes recursively
   * with improved whitespace handling
   */
  private getTextDescendants(node: XMLNode): TDescendant[] {
    // Start with any text content in this node
    const descendants: TDescendant[] = [];

    // Preserve the node's text content, don't trim
    if (node.content) {
      // Check if this specific text content is being generated
      const contentText = node.content;

      descendants.push({
        text: contentText,
        // Check if this specific text content should have the generating mark
        ...(this.shouldHaveGeneratingMark(contentText)
          ? { generating: true }
          : {}),
      } as GeneratingText);
    }

    // Process all children
    for (const child of node.children) {
      const childTag = child.tag.toUpperCase();

      // Handle inline formatting elements
      if (childTag === "B" || childTag === "STRONG") {
        const content = this.getTextContent(child, false);
        descendants.push({
          text: content, // Don't trim
          bold: true,
          // Check if this content should have the generating mark
          ...(this.shouldHaveGeneratingMark(content)
            ? { generating: true }
            : {}),
        } as TDescendant);
      } else if (childTag === "I" || childTag === "EM") {
        const content = this.getTextContent(child, false);
        descendants.push({
          text: content, // Don't trim
          italic: true,
          // Check if this content should have the generating mark
          ...(this.shouldHaveGeneratingMark(content)
            ? { generating: true }
            : {}),
        } as TDescendant);
      } else if (childTag === "U") {
        const content = this.getTextContent(child, false);
        descendants.push({
          text: content, // Don't trim
          underline: true,
          // Check if this content should have the generating mark
          ...(this.shouldHaveGeneratingMark(content)
            ? { generating: true }
            : {}),
        } as TDescendant);
      } else if (childTag === "S" || childTag === "STRIKE") {
        const content = this.getTextContent(child, false);
        descendants.push({
          text: content, // Don't trim
          strikethrough: true,
          // Check if this content should have the generating mark
          ...(this.shouldHaveGeneratingMark(content)
            ? { generating: true }
            : {}),
        } as TDescendant);
      }
      // For other elements, recursively process them
      else {
        const processedChild = this.processNode(child);
        if (processedChild) {
          descendants.push(processedChild as TDescendant);
        }
      }
    }

    // Clean up empty text nodes and combine adjacent text nodes with same formatting
    const cleanedDescendants: TDescendant[] = [];

    for (const descendant of descendants) {
      // Skip completely empty text nodes
      if ("text" in descendant && descendant.text === "") {
        continue;
      }

      // Add non-empty descendants
      cleanedDescendants.push(descendant);
    }

    // If we have no descendants, return a single empty text node
    return cleanedDescendants.length > 0
      ? cleanedDescendants
      : [{ text: "" } as TText];
  }

  /**
   * Get the complete text content of a node, including child text
   * with improved whitespace handling
   */
  private getTextContent(node: XMLNode, trim = true): string {
    // Get this node's content, preserving whitespace
    let text = trim ? node.content.trim() : node.content;

    // Add text from all children
    for (const child of node.children) {
      text += this.getTextContent(child, false); // Don't trim child content
    }

    return text;
  }

  /**
   * Process a list of XMLNodes into Plate elements
   */
  private processNodes(nodes: XMLNode[]): PlateNode[] {
    const plateNodes: PlateNode[] = [];

    for (const node of nodes) {
      const processedNode = this.processNode(node);
      if (processedNode) {
        plateNodes.push(processedNode);
      }
    }

    return plateNodes;
  }

  /**
   * Process a single XMLNode into a Plate element
   */
  private processNode(node: XMLNode): PlateNode | null {
    const tag = node.tag.toUpperCase();

    switch (tag) {
      case "H1":
      case "H2":
      case "H3":
      case "H4":
      case "H5":
      case "H6":
        return this.createHeading(
          tag.toLowerCase() as "h1" | "h2" | "h3" | "h4" | "h5" | "h6",
          node
        );

      case "P":
        return this.createParagraph(node);

      case "IMG":
        // The createImage function will return null for incomplete images
        return this.createImage(node);

      case "COLUMNS":
        return this.createColumns(node);

      case "DIV":
        // Process DIV contents and add to parent
        return this.processDiv(node);

      case "BULLETS":
        return this.createBullets(node);

      case "ICONS":
        return this.createIcons(node);

      case "CYCLE":
        return this.createCycle(node);

      case "STAIRCASE":
        return this.createStaircase(node);

      case "CHART":
        return this.createChart(node);

      // Handle visualization tags with a single function
      case "ARROWS":
        return this.createVisualization(node, "arrow");

      case "PYRAMID":
        return this.createVisualization(node, "pyramid");

      case "TIMELINE":
        return this.createVisualization(node, "timeline");

      case "ICON":
        // Skip processing ICON tags directly - they should be processed by their parent
        // This prevents incomplete icons from being processed
        return null;

      default:
        // For unknown tags, try to process children
        if (node.children.length > 0) {
          const children = this.processNodes(node.children);
          // If we have valid children but don't know the parent tag type,
          // default to a paragraph containing the children
          if (children.length > 0) {
            return {
              type: "p",
              children: children as TDescendant[],
            } as ParagraphElement;
          }
        }

        // If no children to process, return null
        return null;
    }
  }
}

// Example usage
export function parseSlideXml(xmlData: string): PlateSlide[] {
  const parser = new SlideParser();
  parser.parseChunk(xmlData);
  parser.finalize();
  return parser.getAllSlides();
}
