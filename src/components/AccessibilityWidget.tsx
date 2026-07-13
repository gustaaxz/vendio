import { useEffect, useState } from "react";
import { Accessibility, Type, Contrast, MousePointer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export function AccessibilityWidget() {
  const [fontScale, setFontScale] = useState(1);
  const [highContrast, setHighContrast] = useState(false);
  const [grayscale, setGrayscale] = useState(false);
  const [bigCursor, setBigCursor] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    root.style.fontSize = `${16 * fontScale}px`;
    root.classList.toggle("a11y-hc", highContrast);
    root.classList.toggle("a11y-gray", grayscale);
    root.classList.toggle("a11y-cursor", bigCursor);
  }, [fontScale, highContrast, grayscale, bigCursor]);

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            size="icon"
            className="h-14 w-14 rounded-full shadow-xl bg-primary hover:bg-primary/90"
            aria-label="Acessibilidade"
          >
            <Accessibility className="h-6 w-6" />
          </Button>
        </PopoverTrigger>
        <PopoverContent side="top" align="end" className="w-72">
          <h4 className="font-semibold mb-3">Acessibilidade</h4>
          <div className="space-y-3 text-sm">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="flex items-center gap-2">
                  <Type className="h-4 w-4" /> Tamanho da fonte
                </span>
                <span className="text-xs text-muted-foreground">{Math.round(fontScale * 100)}%</span>
              </div>
              <div className="flex gap-1">
                <Button size="sm" variant="outline" onClick={() => setFontScale(Math.max(0.8, fontScale - 0.1))}>−</Button>
                <Button size="sm" variant="outline" onClick={() => setFontScale(1)}>A</Button>
                <Button size="sm" variant="outline" onClick={() => setFontScale(Math.min(1.5, fontScale + 0.1))}>+</Button>
              </div>
            </div>
            <Button
              variant={highContrast ? "default" : "outline"}
              className="w-full justify-start"
              onClick={() => setHighContrast(!highContrast)}
            >
              <Contrast className="h-4 w-4 mr-2" /> Alto contraste
            </Button>
            <Button
              variant={grayscale ? "default" : "outline"}
              className="w-full justify-start"
              onClick={() => setGrayscale(!grayscale)}
            >
              <Contrast className="h-4 w-4 mr-2" /> Tons de cinza
            </Button>
            <Button
              variant={bigCursor ? "default" : "outline"}
              className="w-full justify-start"
              onClick={() => setBigCursor(!bigCursor)}
            >
              <MousePointer className="h-4 w-4 mr-2" /> Cursor grande
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
