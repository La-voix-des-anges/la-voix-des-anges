import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/lib/auth";
import { ThemeProvider } from "@/lib/theme";

import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home";
import ArticlePage from "@/pages/article";
import AuthorPage from "@/pages/author";
import AuthorsPage from "@/pages/authors";
import CategoriesPage from "@/pages/categories";
import CategoryPage from "@/pages/category";
import AboutPage from "@/pages/about";
import LoginPage from "@/pages/login";

import { DashboardLayout } from "@/pages/dashboard/layout";
import DashboardPage from "@/pages/dashboard/index";
import MyArticlesPage from "@/pages/dashboard/articles";
import NewArticlePage from "@/pages/dashboard/new-article";
import EditArticlePage from "@/pages/dashboard/edit-article";
import AllArticlesPage from "@/pages/dashboard/all-articles";
import UsersPage from "@/pages/dashboard/users";
import CategoriesAdminPage from "@/pages/dashboard/categories-admin";
import DiscussionsPage from "@/pages/dashboard/discussions";

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/article/:slug" component={ArticlePage} />
      <Route path="/auteur/:username" component={AuthorPage} />
      <Route path="/auteurs" component={AuthorsPage} />
      <Route path="/categories" component={CategoriesPage} />
      <Route path="/categorie/:slug" component={CategoryPage} />
      <Route path="/a-propos" component={AboutPage} />
      <Route path="/connexion" component={LoginPage} />

      <Route path="/dashboard">
        <DashboardLayout>
          <DashboardPage />
        </DashboardLayout>
      </Route>
      <Route path="/dashboard/articles">
        <DashboardLayout>
          <MyArticlesPage />
        </DashboardLayout>
      </Route>
      <Route path="/dashboard/nouveau">
        <DashboardLayout>
          <NewArticlePage />
        </DashboardLayout>
      </Route>
      <Route path="/dashboard/article/:id">
        <DashboardLayout>
          <EditArticlePage />
        </DashboardLayout>
      </Route>
      <Route path="/dashboard/tous-les-articles">
        <DashboardLayout>
          <AllArticlesPage />
        </DashboardLayout>
      </Route>
      <Route path="/dashboard/utilisateurs">
        <DashboardLayout>
          <UsersPage />
        </DashboardLayout>
      </Route>
      <Route path="/dashboard/categories">
        <DashboardLayout>
          <CategoriesAdminPage />
        </DashboardLayout>
      </Route>
      <Route path="/dashboard/discussions">
        <DashboardLayout>
          <DiscussionsPage />
        </DashboardLayout>
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
