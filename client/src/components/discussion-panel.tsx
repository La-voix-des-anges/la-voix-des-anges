import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Send,
  Hash,
  Plus,
  FileText,
  Loader2,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { ChannelWithDetails, MessageWithAuthor } from "@shared/schema";

const channelSchema = z.object({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  description: z.string().optional(),
});

const messageSchema = z.object({
  content: z.string().min(1, "Le message ne peut pas être vide"),
});

type ChannelFormData = z.infer<typeof channelSchema>;
type MessageFormData = z.infer<typeof messageSchema>;

interface MessageItemProps {
  message: MessageWithAuthor;
  isOwn: boolean;
}

function MessageItem({ message, isOwn }: MessageItemProps) {
  const formattedTime = new Date(message.createdAt).toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className={`flex gap-3 ${isOwn ? "flex-row-reverse" : ""}`} data-testid={`message-${message.id}`}>
      <Avatar className="h-8 w-8 flex-shrink-0">
        <AvatarImage src={message.author.avatarUrl} />
        <AvatarFallback className="text-xs">
          {message.author.displayName.charAt(0)}
        </AvatarFallback>
      </Avatar>
      <div className={`max-w-[70%] ${isOwn ? "items-end" : ""}`}>
        <div className="flex items-center gap-2 mb-1">
          {!isOwn && (
            <span className="font-medium text-sm" data-testid="text-message-author">
              {message.author.displayName}
            </span>
          )}
          <span className="text-xs text-muted-foreground">{formattedTime}</span>
        </div>
        <div
          className={`rounded-lg px-3 py-2 text-sm ${
            isOwn
              ? "bg-primary text-primary-foreground"
              : "bg-muted"
          }`}
        >
          <p data-testid="text-message-content">{message.content}</p>
        </div>
      </div>
    </div>
  );
}

interface ChannelItemProps {
  channel: ChannelWithDetails;
  isActive: boolean;
  onClick: () => void;
}

function ChannelItem({ channel, isActive, onClick }: ChannelItemProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors hover-elevate ${
        isActive ? "bg-sidebar-accent" : ""
      }`}
      data-testid={`channel-${channel.id}`}
    >
      <div className="flex-shrink-0">
        {channel.articleId ? (
          <FileText className="h-5 w-5 text-muted-foreground" />
        ) : (
          <Hash className="h-5 w-5 text-muted-foreground" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm truncate" data-testid="text-channel-name">
          {channel.name}
        </p>
        {channel.lastMessage && (
          <p className="text-xs text-muted-foreground truncate">
            {channel.lastMessage.author.displayName}: {channel.lastMessage.content}
          </p>
        )}
      </div>
      {channel.unreadCount && channel.unreadCount > 0 && (
        <span className="flex-shrink-0 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
          {channel.unreadCount}
        </span>
      )}
    </button>
  );
}

export function DiscussionPanel() {
  const { user, isAdmin } = useAuth();
  const { toast } = useToast();
  const [selectedChannelId, setSelectedChannelId] = useState<string | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: channels = [], isLoading: channelsLoading } = useQuery<ChannelWithDetails[]>({
    queryKey: ["/api/channels"],
  });

  const { data: messages = [], isLoading: messagesLoading } = useQuery<MessageWithAuthor[]>({
    queryKey: ["/api/messages", selectedChannelId],
    enabled: !!selectedChannelId,
  });

  const selectedChannel = channels.find((c) => c.id === selectedChannelId);

  useEffect(() => {
    if (channels.length > 0 && !selectedChannelId) {
      setSelectedChannelId(channels[0].id);
    }
  }, [channels, selectedChannelId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const channelForm = useForm<ChannelFormData>({
    resolver: zodResolver(channelSchema),
    defaultValues: { name: "", description: "" },
  });

  const messageForm = useForm<MessageFormData>({
    resolver: zodResolver(messageSchema),
    defaultValues: { content: "" },
  });

  const createChannelMutation = useMutation({
    mutationFn: async (data: ChannelFormData) => {
      return apiRequest("POST", "/api/channels", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/channels"] });
      setCreateDialogOpen(false);
      channelForm.reset();
      toast({
        title: "Salon créé",
        description: "Le salon de discussion a été créé avec succès.",
      });
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible de créer le salon. Veuillez réessayer.",
        variant: "destructive",
      });
    },
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (data: MessageFormData) => {
      return apiRequest("POST", "/api/messages", {
        channelId: selectedChannelId,
        content: data.content,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/messages", selectedChannelId] });
      messageForm.reset();
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer le message. Veuillez réessayer.",
        variant: "destructive",
      });
    },
  });

  const onCreateChannel = (data: ChannelFormData) => {
    createChannelMutation.mutate(data);
  };

  const onSendMessage = (data: MessageFormData) => {
    if (!selectedChannelId) return;
    sendMessageMutation.mutate(data);
  };

  return (
    <div className="flex h-full">
      <div className="w-80 border-r border-border flex flex-col">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h2 className="font-semibold flex items-center gap-2">
            <Users className="h-5 w-5" />
            Discussions
          </h2>
          {isAdmin && (
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button size="icon" variant="ghost" data-testid="button-create-channel">
                  <Plus className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Nouveau salon</DialogTitle>
                  <DialogDescription>
                    Créez un nouveau salon de discussion pour l'équipe.
                  </DialogDescription>
                </DialogHeader>
                <Form {...channelForm}>
                  <form onSubmit={channelForm.handleSubmit(onCreateChannel)} className="space-y-4">
                    <FormField
                      control={channelForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nom du salon</FormLabel>
                          <FormControl>
                            <Input placeholder="ex: général" {...field} data-testid="input-channel-name" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={channelForm.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description (optionnel)</FormLabel>
                          <FormControl>
                            <Input placeholder="Description du salon" {...field} data-testid="input-channel-description" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <DialogFooter>
                      <Button type="submit" disabled={createChannelMutation.isPending} data-testid="button-submit-channel">
                        {createChannelMutation.isPending && (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        )}
                        Créer
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          )}
        </div>

        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {channelsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : channels.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">
                Aucun salon disponible.
              </div>
            ) : (
              channels.map((channel) => (
                <ChannelItem
                  key={channel.id}
                  channel={channel}
                  isActive={channel.id === selectedChannelId}
                  onClick={() => setSelectedChannelId(channel.id)}
                />
              ))
            )}
          </div>
        </ScrollArea>
      </div>

      <div className="flex-1 flex flex-col">
        {selectedChannel ? (
          <>
            <div className="p-4 border-b border-border">
              <div className="flex items-center gap-2">
                {selectedChannel.articleId ? (
                  <FileText className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <Hash className="h-5 w-5 text-muted-foreground" />
                )}
                <h3 className="font-semibold" data-testid="text-active-channel">
                  {selectedChannel.name}
                </h3>
              </div>
              {selectedChannel.description && (
                <p className="text-sm text-muted-foreground mt-1">
                  {selectedChannel.description}
                </p>
              )}
            </div>

            <ScrollArea className="flex-1 p-4">
              {messagesLoading ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                  <Hash className="h-12 w-12 mb-3 opacity-20" />
                  <p>Aucun message dans ce salon.</p>
                  <p className="text-sm">Soyez le premier à écrire !</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((message) => (
                    <MessageItem
                      key={message.id}
                      message={message}
                      isOwn={message.authorId === user?.id}
                    />
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </ScrollArea>

            <div className="p-4 border-t border-border">
              <Form {...messageForm}>
                <form
                  onSubmit={messageForm.handleSubmit(onSendMessage)}
                  className="flex gap-2"
                >
                  <FormField
                    control={messageForm.control}
                    name="content"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormControl>
                          <Input
                            placeholder={`Message #${selectedChannel.name}`}
                            {...field}
                            data-testid="input-message"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <Button
                    type="submit"
                    size="icon"
                    disabled={sendMessageMutation.isPending}
                    data-testid="button-send-message"
                  >
                    {sendMessageMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </form>
              </Form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <Hash className="h-16 w-16 mx-auto mb-4 opacity-20" />
              <p>Sélectionnez un salon pour commencer</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
