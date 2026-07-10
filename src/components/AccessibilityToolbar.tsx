import { useState } from "react";
import {
  Moon,
  Sun,
  Type,
  Eye,
  Focus,
  Calculator,
  StickyNote,
  EyeOff,
  Trash2,
  HelpCircle,
  Settings2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { toast } from "sonner";

export function AccessibilityToolbar() {
  const [open, setOpen] = useState(false);
  const [isDark, setIsDark] = useState(true);
  const [isHighContrast, setIsHighContrast] = useState(false);
  const [isHiddenValues, setIsHiddenValues] = useState(false);
  const [showCalculator, setShowCalculator] = useState(false);
  
  const toggleTheme = () => {
    setIsDark(!isDark);
    if (!isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const handleClearCache = () => {
    toast.success("Cache limpo com sucesso! A aplicação recarregará.");
    setTimeout(() => window.location.reload(), 1500);
  };

  return (
    <>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button
            size="icon"
            className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-2xl z-50 hover:scale-105 transition-transform"
          >
            <Settings2 className="w-6 h-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-[300px] overflow-y-auto">
          <SheetHeader className="mb-6">
            <SheetTitle>Ferramentas & Acessibilidade</SheetTitle>
          </SheetHeader>

          <div className="space-y-6">
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Visualização</h4>
              
              <Button variant="outline" className="w-full justify-start gap-3" onClick={toggleTheme}>
                {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                Modo {isDark ? "Claro" : "Escuro"}
              </Button>
              
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1 gap-2" onClick={() => toast("Fonte aumentada")}>
                  <Type className="w-4 h-4" /> A+
                </Button>
                <Button variant="outline" className="flex-1 gap-2" onClick={() => toast("Fonte diminuída")}>
                  <Type className="w-4 h-4" /> A-
                </Button>
              </div>

              <Button variant="outline" className="w-full justify-start gap-3" onClick={() => {
                setIsHighContrast(!isHighContrast);
                toast(isHighContrast ? "Alto contraste desativado" : "Alto contraste ativado");
              }}>
                <Eye className="w-4 h-4" /> Alto Contraste
              </Button>

              <Button variant="outline" className="w-full justify-start gap-3" onClick={() => {
                setIsHiddenValues(!isHiddenValues);
                toast(isHiddenValues ? "Valores exibidos" : "Valores ocultos (Privacidade)");
              }}>
                {isHiddenValues ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                Modo Privacidade
              </Button>
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Produtividade</h4>
              
              <Button variant="outline" className="w-full justify-start gap-3" onClick={() => toast("Modo foco ativado! (Sidebar oculta)")}>
                <Focus className="w-4 h-4" /> Modo Foco
              </Button>

              <Button variant="outline" className="w-full justify-start gap-3" onClick={() => setShowCalculator(!showCalculator)}>
                <Calculator className="w-4 h-4" /> Calculadora Rápida
              </Button>

              <Button variant="outline" className="w-full justify-start gap-3" onClick={() => toast("Bloco de notas aberto")}>
                <StickyNote className="w-4 h-4" /> Bloco de Notas
              </Button>
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Sistema</h4>
              
              <Button variant="outline" className="w-full justify-start gap-3 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={handleClearCache}>
                <Trash2 className="w-4 h-4" /> Limpar Cache Local
              </Button>

              <Button variant="outline" className="w-full justify-start gap-3 text-blue-500 hover:text-blue-500 hover:bg-blue-500/10" onClick={() => toast("Abrindo central de ajuda...")}>
                <HelpCircle className="w-4 h-4" /> Central de Ajuda
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Floating Calculator Overlay Example */}
      {showCalculator && (
        <div className="fixed bottom-24 right-6 w-64 bg-card border shadow-xl rounded-xl p-4 z-40">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold">Calculadora</h3>
            <button onClick={() => setShowCalculator(false)} className="text-muted-foreground hover:text-foreground">✕</button>
          </div>
          <div className="bg-muted p-3 text-right rounded mb-3 font-mono text-xl">
            0
          </div>
          <div className="grid grid-cols-4 gap-2">
            {[7,8,9,'/',4,5,6,'*',1,2,3,'-','C',0,'=','+'].map(btn => (
              <Button key={btn} variant={typeof btn === 'number' ? 'outline' : 'default'} className="h-10">
                {btn}
              </Button>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
