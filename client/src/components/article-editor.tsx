import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import {
  Save,
  Send,
  Loader2,
  Image as ImageIcon,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { StatusBadge } from "./status-badge";
import type { Article, Category, Tag, ArticleStatus } from "@shared/schema";

const articleFormSchema = z.object({
  title: z.string().min(5, "Le titre doit contenir au moins 5 caractères"),
  slug: z.string().min(3, "Le slug doit contenir au moins 3 caractères"),
  excerpt: z.string().min(10, "L'extrait doit contenir au moins 10 caractères"),
  content: z.string().min(50, "Le contenu doit contenir au moins 50 caractères"),
  coverImageUrl: z.string().optional(),
  categoryId: z.string().min(1, "Veuillez sélectionner une catégorie"),
  tagIds: z.array(z.string()).default([]),
});

type ArticleFormData = z.infer<typeof articleFormSchema>;

interface ArticleEditorProps {
  article?: Article;
  mode: "create" | "edit";
}

export function ArticleEditor({ article, mode }: ArticleEditorProps) {
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const { data: tags = [] } = useQuery<Tag[]>({
    queryKey: ["/api/tags"],
  });

  const form = useForm<ArticleFormData>({
    resolver: zodResolver(articleFormSchema),
    defaultValues: {
      title: article?.title || "",
      slug: article?.slug || "",
      excerpt: article?.excerpt || "",
      content: article?.content || "",
      coverImageUrl: article?.coverImageUrl || "",
      categoryId: article?.categoryId || "",
      tagIds: article?.tagIds || [],
    },
  });

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  const watchTitle = form.watch("title");

  useEffect(() => {
    if (mode === "create" && watchTitle && !form.getValues("slug")) {
      form.setValue("slug", generateSlug(watchTitle));
    }
  }, [watchTitle, mode, form]);

  const createMutation = useMutation({
    mutationFn: async (data: ArticleFormData & { status: ArticleStatus }) => {
      return apiRequest("POST", "/api/articles", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/articles"] });
      toast({
        title: "Article créé",
        description: "Votre article a été créé avec succès.",
      });
      navigate("/dashboard/articles");
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible de créer l'article. Veuillez réessayer.",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: ArticleFormData & { status?: ArticleStatus }) => {
      return apiRequest("PATCH", `/api/articles/${article?.id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/articles"] });
      queryClient.invalidateQueries({ queryKey: ["/api/articles", article?.id] });
      toast({
        title: "Article mis à jour",
        description: "Votre article a été mis à jour avec succès.",
      });
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour l'article. Veuillez réessayer.",
        variant: "destructive",
      });
    },
  });

  const onSaveDraft = (data: ArticleFormData) => {
    const processedData = {
      ...data,
      categoryId: parseInt(data.categoryId, 10),
      tagIds: data.tagIds.map((id) => parseInt(id, 10)),
    };
    if (mode === "create") {
      createMutation.mutate({ ...processedData, status: "draft" });
    } else {
      updateMutation.mutate(processedData);
    }
  };

  const onSubmitForReview = (data: ArticleFormData) => {
    const processedData = {
      ...data,
      categoryId: parseInt(data.categoryId, 10),
      tagIds: data.tagIds.map((id) => parseInt(id, 10)),
    };
    if (mode === "create") {
      createMutation.mutate({ ...processedData, status: "pending" });
    } else {
      updateMutation.mutate({ ...processedData, status: "pending" });
    }
  };

  const toggleTag = (tagId: string) => {
    const currentTags = form.getValues("tagIds");
    if (currentTags.includes(tagId)) {
      form.setValue(
        "tagIds",
        currentTags.filter((id) => id !== tagId)
      );
    } else {
      form.setValue("tagIds", [...currentTags, tagId]);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl font-bold" data-testid="text-editor-title">
            {mode === "create" ? "Nouvel article" : "Modifier l'article"}
          </h1>
          {article && (
            <div className="mt-2">
              <StatusBadge status={article.status} />
            </div>
          )}
        </div>
      </div>

      <Form {...form}>
        <form className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Contenu</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Titre</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Titre de l'article"
                            className="text-lg font-serif"
                            {...field}
                            data-testid="input-article-title"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="slug"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Slug (URL)</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="titre-de-larticle"
                            {...field}
                            data-testid="input-article-slug"
                          />
                        </FormControl>
                        <FormDescription>
                          L'URL de l'article: /article/{field.value || "..."}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="excerpt"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Extrait</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Un court résumé de l'article..."
                            className="resize-none"
                            rows={3}
                            {...field}
                            data-testid="input-article-excerpt"
                          />
                        </FormControl>
                        <FormDescription>
                          Affiché dans les listes d'articles et les aperçus.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="content"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contenu</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Écrivez votre article ici..."
                            className="min-h-[300px] resize-y font-mono text-sm"
                            {...field}
                            data-testid="input-article-content"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Publication</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="categoryId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Catégorie</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger data-testid="select-category">
                              <SelectValue placeholder="Sélectionner une catégorie" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {categories.map((category) => (
                              <SelectItem
                                key={category.id}
                                value={category.id}
                                data-testid={`option-category-${category.id}`}
                              >
                                <div className="flex items-center gap-2">
                                  <div
                                    className="w-3 h-3 rounded-full"
                                    style={{ backgroundColor: category.color }}
                                  />
                                  {category.name}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="tagIds"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tags</FormLabel>
                        <div className="flex flex-wrap gap-2">
                          {tags.map((tag) => (
                            <Badge
                              key={tag.id}
                              variant={
                                field.value.includes(tag.id)
                                  ? "default"
                                  : "outline"
                              }
                              className="cursor-pointer"
                              onClick={() => toggleTag(tag.id)}
                              data-testid={`tag-${tag.id}`}
                            >
                              {tag.name}
                              {field.value.includes(tag.id) && (
                                <X className="h-3 w-3 ml-1" />
                              )}
                            </Badge>
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Image de couverture</CardTitle>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="coverImageUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <div className="space-y-3">
                            <Input
                              placeholder="URL de l'image"
                              {...field}
                              data-testid="input-cover-image"
                            />
                            {field.value ? (
                              <div className="relative aspect-video rounded-lg overflow-hidden bg-muted">
                                <img
                                  src={field.value}
                                  alt="Couverture"
                                  className="object-cover w-full h-full"
                                />
                              </div>
                            ) : (
                              <div className="aspect-video rounded-lg border-2 border-dashed border-muted-foreground/25 flex items-center justify-center">
                                <div className="text-center text-muted-foreground">
                                  <ImageIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                  <p className="text-sm">Aucune image</p>
                                </div>
                              </div>
                            )}
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              <div className="flex flex-col gap-3">
                <Button
                  type="button"
                  variant="outline"
                  disabled={isPending}
                  onClick={form.handleSubmit(onSaveDraft)}
                  data-testid="button-save-draft"
                >
                  {isPending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Sauvegarder le brouillon
                </Button>
                <Button
                  type="button"
                  disabled={isPending}
                  onClick={form.handleSubmit(onSubmitForReview)}
                  data-testid="button-submit-review"
                >
                  {isPending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4 mr-2" />
                  )}
                  Soumettre pour validation
                </Button>
              </div>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
