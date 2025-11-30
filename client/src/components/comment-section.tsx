import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Send, MessageSquare, CornerDownRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { CommentWithAuthor } from "@shared/schema";

const commentSchema = z.object({
  content: z.string().min(3, "Le commentaire doit contenir au moins 3 caractères"),
});

type CommentFormData = z.infer<typeof commentSchema>;

interface CommentItemProps {
  comment: CommentWithAuthor;
  articleId: string;
  onReply?: (parentId: string) => void;
}

function CommentItem({ comment, articleId, onReply }: CommentItemProps) {
  const formattedDate = new Date(comment.createdAt).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="flex gap-3" data-testid={`comment-${comment.id}`}>
      <Avatar className="h-8 w-8 flex-shrink-0">
        <AvatarImage src={comment.author.avatarUrl} />
        <AvatarFallback className="text-xs">
          {comment.author.displayName.charAt(0)}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="bg-muted/50 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-sm" data-testid="text-comment-author">
              {comment.author.displayName}
            </span>
            <span className="text-xs text-muted-foreground">
              {formattedDate}
            </span>
          </div>
          <p className="text-sm" data-testid="text-comment-content">
            {comment.content}
          </p>
        </div>
        {onReply && (
          <Button
            variant="ghost"
            size="sm"
            className="mt-1 text-xs"
            onClick={() => onReply(comment.id)}
            data-testid={`button-reply-${comment.id}`}
          >
            <CornerDownRight className="h-3 w-3 mr-1" />
            Répondre
          </Button>
        )}
        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-3 space-y-3 pl-4 border-l-2 border-muted">
            {comment.replies.map((reply) => (
              <CommentItem
                key={reply.id}
                comment={reply}
                articleId={articleId}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

interface CommentSectionProps {
  articleId: string;
}

export function CommentSection({ articleId }: CommentSectionProps) {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [replyingTo, setReplyingTo] = useState<string | null>(null);

  const { data: comments = [], isLoading } = useQuery<CommentWithAuthor[]>({
    queryKey: ["/api/comments", articleId],
  });

  const form = useForm<CommentFormData>({
    resolver: zodResolver(commentSchema),
    defaultValues: {
      content: "",
    },
  });

  const createCommentMutation = useMutation({
    mutationFn: async (data: CommentFormData) => {
      return apiRequest("POST", "/api/comments", {
        articleId,
        content: data.content,
        parentId: replyingTo,
      });
    },
    onSuccess: () => {
      form.reset();
      setReplyingTo(null);
      queryClient.invalidateQueries({ queryKey: ["/api/comments", articleId] });
      toast({
        title: "Commentaire ajouté",
        description: "Votre commentaire a été publié avec succès.",
      });
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible de publier le commentaire. Veuillez réessayer.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: CommentFormData) => {
    createCommentMutation.mutate(data);
  };

  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <MessageSquare className="h-5 w-5" />
          Commentaires ({comments.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {isAuthenticated ? (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {replyingTo && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CornerDownRight className="h-4 w-4" />
                  <span>Réponse à un commentaire</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setReplyingTo(null)}
                  >
                    Annuler
                  </Button>
                </div>
              )}
              <div className="flex gap-3">
                <Avatar className="h-8 w-8 flex-shrink-0">
                  <AvatarImage src={user?.avatarUrl} />
                  <AvatarFallback className="text-xs">
                    {user?.displayName?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <FormField
                    control={form.control}
                    name="content"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Textarea
                            placeholder="Écrivez un commentaire..."
                            className="resize-none min-h-[80px]"
                            {...field}
                            data-testid="input-comment"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={createCommentMutation.isPending}
                  data-testid="button-submit-comment"
                >
                  {createCommentMutation.isPending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4 mr-2" />
                  )}
                  Publier
                </Button>
              </div>
            </form>
          </Form>
        ) : (
          <div className="text-center py-6 bg-muted/30 rounded-lg">
            <p className="text-muted-foreground">
              Connectez-vous pour laisser un commentaire.
            </p>
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-20" />
            <p>Aucun commentaire pour le moment.</p>
            <p className="text-sm">Soyez le premier à commenter !</p>
          </div>
        ) : (
          <div className="space-y-4">
            {comments.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                articleId={articleId}
                onReply={isAuthenticated ? setReplyingTo : undefined}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
