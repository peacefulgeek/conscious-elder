import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { OrganizationJsonLd } from "./components/JsonLd";
import Home from "./pages/Home";
import Articles from "./pages/Articles";
import ArticleDetail from "./pages/ArticleDetail";
import Recommended from "./pages/Recommended";
import Herbs from "./pages/Herbs";
import About from "./pages/About";
import Privacy from "./pages/Privacy";
import Assessments from "./pages/Assessments";
import Quiz from "./pages/Quiz";
import QuizResults from './pages/QuizResults';
import AssessmentHistory from './pages/AssessmentHistory';
import NewsletterPopup from "@/components/NewsletterPopup";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/articles" component={Articles} />
      <Route path="/articles/:slug" component={ArticleDetail} />
      <Route path="/recommended" component={Recommended} />
      <Route path="/herbs" component={Herbs} />
      <Route path="/about" component={About} />
      <Route path="/privacy" component={Privacy} />
      <Route path="/assessments" component={Assessments} />
      <Route path="/assessments/history" component={AssessmentHistory} />
      <Route path="/assessments/:quizId/results" component={QuizResults} />
      <Route path="/assessments/:quizId" component={Quiz} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
      <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <OrganizationJsonLd />
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

      <NewsletterPopup />
export default App;
