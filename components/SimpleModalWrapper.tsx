"use client";

import {useRouter} from "next/navigation";
import {Dialog, DialogContent, DialogOverlay, DialogTitle} from "./ui/dialog";

export default function Modal({children, title}: { children: React.ReactNode, title: string }) {
  const router = useRouter();

  return (
    <Dialog
      defaultOpen={true}
      open={true}
      onOpenChange={() => router.back()}
    >
      <DialogOverlay>
        <DialogTitle className={"text-transparent"}>
          {title}
        </DialogTitle>
        <DialogContent showCloseButton={true}  className={"w-1/2 sm:max-w-full max-h-[85vh] overflow-y-auto"}>
          {children}
        </DialogContent>
      </DialogOverlay>
    </Dialog>
  );
}