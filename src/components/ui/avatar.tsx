"use client";

import * as React from 'react';
import Image from 'next/image';

import { cn } from '@/lib/utils';

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

interface AvatarImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  className?: string;
  onLoadingStatusChange?: (
    status: "idle" | "loading" | "loaded" | "error"
  ) => void;
}

interface AvatarFallbackProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  delayMs?: number;
}

const AvatarContext = React.createContext<{
  imageLoadingStatus: "idle" | "loading" | "loaded" | "error";
  onImageLoadingStatusChange: (
    status: "idle" | "loading" | "loaded" | "error"
  ) => void;
}>({
  imageLoadingStatus: "idle",
  onImageLoadingStatusChange: () => {},
});

function Avatar({ className, ...props }: AvatarProps) {
  const [imageLoadingStatus, setImageLoadingStatus] = React.useState<
    "idle" | "loading" | "loaded" | "error"
  >("idle");

  return (
    <AvatarContext.Provider
      value={{
        imageLoadingStatus,
        onImageLoadingStatusChange: setImageLoadingStatus,
      }}
    >
      <div
        data-slot="avatar"
        className={cn(
          "relative flex size-8 shrink-0 overflow-hidden rounded-full",
          className
        )}
        {...props}
      />
    </AvatarContext.Provider>
  );
}

function AvatarImage({
  className,
  onLoadingStatusChange,
  ...props
}: AvatarImageProps) {
  const { onImageLoadingStatusChange } = React.useContext(AvatarContext);
  const [loadingStatus, setLoadingStatus] = React.useState<
    "idle" | "loading" | "loaded" | "error"
  >("idle");

  React.useEffect(() => {
    if (props.src) {
      setLoadingStatus("loading");
      onImageLoadingStatusChange("loading");
      onLoadingStatusChange?.("loading");
    }
  }, [props.src, onImageLoadingStatusChange, onLoadingStatusChange]);

  const handleLoad = React.useCallback(() => {
    setLoadingStatus("loaded");
    onImageLoadingStatusChange("loaded");
    onLoadingStatusChange?.("loaded");
  }, [onImageLoadingStatusChange, onLoadingStatusChange]);

  const handleError = React.useCallback(() => {
    setLoadingStatus("error");
    onImageLoadingStatusChange("error");
    onLoadingStatusChange?.("error");
  }, [onImageLoadingStatusChange, onLoadingStatusChange]);

  if (loadingStatus === "error" || !props.src) {
    return null;
  }
  return (
    <Image
      data-slot="avatar-image"
      className={cn("aspect-square size-full", className)}
      onLoad={handleLoad}
      onError={handleError}
      alt={props.alt ?? ""}
      fill
      {...props}
    />
  );
}

function AvatarFallback({
  className,
  delayMs = 0,
  children,
  ...props
}: AvatarFallbackProps) {
  const { imageLoadingStatus } = React.useContext(AvatarContext);
  const [canRender, setCanRender] = React.useState(delayMs === 0);

  React.useEffect(() => {
    if (delayMs > 0) {
      const timer = setTimeout(() => setCanRender(true), delayMs);
      return () => clearTimeout(timer);
    }
  }, [delayMs]);

  if (!canRender || imageLoadingStatus === "loaded") {
    return null;
  }

  return (
    <div
      data-slot="avatar-fallback"
      className={cn(
        "bg-muted flex size-full items-center justify-center rounded-full",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export { Avatar, AvatarImage, AvatarFallback };
