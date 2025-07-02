import { useEasterEggs } from "@/hooks/use-easter-eggs";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Lock, CheckCircle } from "lucide-react";

export default function EasterEggCounter() {
  const { easterEggs, unlockedCount, totalCount } = useEasterEggs();

  if (unlockedCount === 0) return null;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <div className="easter-egg-counter">
          🥚 {unlockedCount}/{totalCount}
        </div>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Easter Eggs Collection
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          {easterEggs.map((egg) => (
            <Card key={egg.id} className={egg.unlocked ? "bg-green-50 dark:bg-green-900/20" : "bg-gray-50 dark:bg-gray-800"}>
              <CardContent className="p-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{egg.icon}</span>
                      <h4 className="font-medium">{egg.name}</h4>
                      {egg.unlocked ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <Lock className="h-4 w-4 text-gray-400" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {egg.description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          
          {unlockedCount === totalCount && (
            <div className="text-center p-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg">
              <Trophy className="h-8 w-8 mx-auto mb-2" />
              <h3 className="font-bold">Parabéns! 🎉</h3>
              <p className="text-sm">Você encontrou todos os Easter Eggs!</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}