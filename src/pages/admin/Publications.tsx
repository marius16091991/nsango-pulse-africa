import { useState } from "react";
import { Send, Clock, CheckCircle, AlertCircle, Calendar, Eye } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";

const queue = [
  { id: 1, title: "Interview : Ngozi Okonjo-Iweala", scheduled: "2026-04-05 08:00", channel: "web", status: "scheduled" },
  { id: 2, title: "Le cinéma africain en 2026", scheduled: "2026-04-06 10:00", channel: "web+newsletter", status: "scheduled" },
  { id: 3, title: "Tech Hub : Kigali Innovation City", scheduled: "2026-04-07 09:00", channel: "web", status: "pending" },
  { id: 4, title: "Fashion Week de Lagos — Galerie", scheduled: "2026-04-08 14:00", channel: "web+social", status: "scheduled" },
];

const published = [
  { id: 5, title: "Aliko Dangote : L'empire", publishedAt: "2026-04-02 08:00", views: 12400, channel: "web+newsletter" },
  { id: 6, title: "Portrait : Wangari Maathai", publishedAt: "2026-03-28 10:00", views: 15600, channel: "web" },
  { id: 7, title: "Burna Boy : talent émergent", publishedAt: "2026-03-25 09:00", views: 22300, channel: "web+social" },
];

const Publications = () => {
  const [autoPublish, setAutoPublish] = useState(true);

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold">Publications & Diffusion</h1>
          <p className="text-sm text-muted-foreground font-body">Planifiez et contrôlez la mise en ligne de vos contenus</p>
        </div>
      </div>

      {/* Settings */}
      <Card>
        <CardContent className="p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Switch id="auto" checked={autoPublish} onCheckedChange={setAutoPublish} />
              <Label htmlFor="auto" className="font-body text-sm">Publication automatique programmée</Label>
            </div>
            <div className="flex items-center gap-3">
              <Label className="font-body text-sm text-muted-foreground">Fuseau horaire :</Label>
              <Select defaultValue="africa">
                <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="africa">Afrique/Lagos (WAT)</SelectItem>
                  <SelectItem value="paris">Europe/Paris (CET)</SelectItem>
                  <SelectItem value="nairobi">Afrique/Nairobi (EAT)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Queue */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-display flex items-center gap-2">
            <Clock className="w-5 h-5 text-gold" /> File de publication ({queue.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {queue.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/30 transition-colors">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{item.title}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-muted-foreground font-body flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> {item.scheduled}
                    </span>
                    <span className="text-xs bg-muted px-2 py-0.5 rounded font-body">{item.channel}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-4">
                  {item.status === "scheduled" ? (
                    <span className="text-xs text-blue-600 flex items-center gap-1 font-body"><CheckCircle className="w-3 h-3" /> Programmé</span>
                  ) : (
                    <span className="text-xs text-amber-600 flex items-center gap-1 font-body"><AlertCircle className="w-3 h-3" /> En attente</span>
                  )}
                  <Button size="sm" variant="outline" className="text-xs font-body gap-1">
                    <Send className="w-3 h-3" /> Publier maintenant
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Published */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-display flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" /> Récemment publiés
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {published.map((item) => (
              <div key={item.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{item.title}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-muted-foreground font-body">{item.publishedAt}</span>
                    <span className="text-xs bg-muted px-2 py-0.5 rounded font-body">{item.channel}</span>
                  </div>
                </div>
                <span className="text-xs text-muted-foreground font-body flex items-center gap-1 shrink-0">
                  <Eye className="w-3 h-3" /> {item.views.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Publications;
