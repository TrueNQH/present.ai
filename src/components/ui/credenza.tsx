"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { useMediaQuery } from "@/hooks/globals/useMediaQuery";

type DialogProps = React.ComponentProps<typeof Dialog>;
type DrawerProps = React.ComponentProps<typeof Drawer>;
type DialogTriggerProps = React.ComponentProps<typeof DialogTrigger>;
type DialogContentProps = React.ComponentProps<typeof DialogContent>;
type DrawerContentProps = React.ComponentProps<typeof DrawerContent>;
type DialogCloseProps = React.ComponentProps<typeof DialogClose>;
type DialogDescriptionProps = React.ComponentProps<typeof DialogDescription>;
type DialogHeaderProps = React.ComponentProps<typeof DialogHeader>;
type DialogTitleProps = React.ComponentProps<typeof DialogTitle>;
type DialogFooterProps = React.ComponentProps<typeof DialogFooter>;

type CredenzaProps = DialogProps & DrawerProps;
type CredenzaTriggerProps = DialogTriggerProps;
type CredenzaContentProps = DialogContentProps & DrawerContentProps;
type CredenzaCloseProps = DialogCloseProps;
type CredenzaDescriptionProps = DialogDescriptionProps;
type CredenzaHeaderProps = DialogHeaderProps;
type CredenzaTitleProps = DialogTitleProps;
type CredenzaFooterProps = DialogFooterProps;

const desktop = "(min-width: 768px)";

const Credenza = ({ children, ...props }: CredenzaProps) => {
  const isDesktop = useMediaQuery(desktop);
  const CredenzaComponent = isDesktop ? Dialog : Drawer;

  return <CredenzaComponent {...props}>{children}</CredenzaComponent>;
};

const CredenzaTrigger = ({ children, ...props }: CredenzaTriggerProps) => {
  const isDesktop = useMediaQuery(desktop);
  const TriggerComponent = isDesktop ? DialogTrigger : DrawerTrigger;

  return <TriggerComponent {...props}>{children}</TriggerComponent>;
};

const CredenzaClose = ({ children, ...props }: CredenzaCloseProps) => {
  const isDesktop = useMediaQuery(desktop);
  const CloseComponent = isDesktop ? DialogClose : DrawerClose;

  return <CloseComponent {...props}>{children}</CloseComponent>;
};

const CredenzaContent = ({ children, ...props }: CredenzaContentProps) => {
  const isDesktop = useMediaQuery(desktop);
  const ContentComponent = isDesktop ? DialogContent : DrawerContent;

  return <ContentComponent {...props}>{children}</ContentComponent>;
};

const CredenzaDescription = ({
  children,
  ...props
}: CredenzaDescriptionProps) => {
  const isDesktop = useMediaQuery(desktop);
  const DescriptionComponent = isDesktop
    ? DialogDescription
    : DrawerDescription;

  return <DescriptionComponent {...props}>{children}</DescriptionComponent>;
};

const CredenzaHeader = ({ children, ...props }: CredenzaHeaderProps) => {
  const isDesktop = useMediaQuery(desktop);
  const HeaderComponent = isDesktop ? DialogHeader : DrawerHeader;

  return <HeaderComponent {...props}>{children}</HeaderComponent>;
};

const CredenzaTitle = ({ children, ...props }: CredenzaTitleProps) => {
  const isDesktop = useMediaQuery(desktop);
  const TitleComponent = isDesktop ? DialogTitle : DrawerTitle;

  return <TitleComponent {...props}>{children}</TitleComponent>;
};

const CredenzaBody = ({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div className={cn("px-4 md:px-0", className)} {...props}>
      {children}
    </div>
  );
};

const CredenzaFooter = ({ children, ...props }: CredenzaFooterProps) => {
  const isDesktop = useMediaQuery(desktop);
  const FooterComponent = isDesktop ? DialogFooter : DrawerFooter;

  return <FooterComponent {...props}>{children}</FooterComponent>;
};

export {
  Credenza,
  CredenzaTrigger,
  CredenzaClose,
  CredenzaContent,
  CredenzaDescription,
  CredenzaHeader,
  CredenzaTitle,
  CredenzaBody,
  CredenzaFooter,
};
