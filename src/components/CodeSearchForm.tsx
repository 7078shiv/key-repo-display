import { useState } from "react";
import { Search, FileText, GitBranch, Loader2, X, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface Match {
  file?: string;
  repo: string;
  code?: string;
  explanation?: string;
  summary?: string;
  DevDescriptionSummary?: string;
}

interface SearchResponse {
  keyword: string;
  matches: Match[];
}

const REPOSITORIES = [
  "adjetter_main",
  "mainserverreports",
  "kapture-report",
  "streamlineservice",
  "ticket-history-analytics",
  "kapture-dashboard",
  "all-repositories"
];

// Code Popup Modal Component
const CodePopup = ({ match, isOpen, onClose }: { match: Match | null, isOpen: boolean, onClose: () => void }) => {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleCopy = async () => {
    if (match?.code) {
      try {
        await navigator.clipboard.writeText(match.code);
        setCopied(true);
        toast({
          title: "Code Copied",
          description: "Code has been copied to clipboard",
        });
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        toast({
          title: "Copy Failed",
          description: "Failed to copy code to clipboard",
          variant: "destructive",
        });
      }
    }
  };

  if (!isOpen || !match) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center space-x-2">
            <FileText className="h-5 w-5 text-info" />
            <h3 className="text-lg font-semibold text-foreground">{match.repo}</h3>
          </div>
          <div className="flex items-center space-x-2">
            {match.code && (
              <Button
                onClick={handleCopy}
                variant="outline"
                size="sm"
                className="flex items-center space-x-2"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    <span>Copy</span>
                  </>
                )}
              </Button>
            )}
            <Button
              onClick={onClose}
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-4">
          {match.file && (
            <div className="mb-4">
              <Label className="text-sm font-medium text-muted-foreground">File Path:</Label>
              <p className="text-sm font-mono text-foreground bg-muted/50 p-2 rounded-md mt-1 break-all">
                {match.file}
              </p>
            </div>
          )}
          
          {match.code ? (
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Code:</Label>
              <div className="mt-2">
                <pre className="bg-muted/50 p-4 rounded-lg overflow-auto text-sm font-mono whitespace-pre-wrap">
                  <code>{match.code}</code>
                </pre>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No code content available for this match</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const CodeSearchForm = () => {
  const [keyword, setKeyword] = useState("");
  const [selectedRepo, setSelectedRepo] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const { toast } = useToast();

  const handleSearch = async () => {
    if (!keyword.trim()) {
      toast({
        title: "Keyword Required",
        description: "Please enter a keyword to search for.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await fetch('http://localhost:8081/analyze/v2', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pr: keyword,
          force: "false",
          repoName: selectedRepo === "all-repositories" ? null : selectedRepo
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: SearchResponse = await response.json();
      setSearchResults(data);
      
      toast({
        title: "Search Complete",
        description: `Found ${data.matches.length} matches for "${keyword}"`,
      });
    } catch (error) {
      console.error('Search error:', error);
      toast({
        title: "Search Failed",
        description: "An error occurred while searching. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleRepoClick = (match: Match) => {
    setSelectedMatch(match);
    setIsPopupOpen(true);
  };

  const closePopup = () => {
    setIsPopupOpen(false);
    setSelectedMatch(null);
  };

  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-lg bg-card">
        <CardHeader className="text-center pb-4">
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-info bg-clip-text text-transparent">
            Partner Resource Search Tool
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Search for keywords across your repositories and get detailed explanations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="keyword" className="text-sm font-medium">
                Search Keyword
              </Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="keyword"
                  type="text"
                  placeholder="e.g., BCCD_SIC_DESIGNATION_ID"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="repository" className="text-sm font-medium">
                Repository
              </Label>
              <Select value={selectedRepo} onValueChange={setSelectedRepo}>
                <SelectTrigger className="w-full">
                  <div className="flex items-center">
                    <GitBranch className="h-4 w-4 mr-2 text-muted-foreground" />
                    <SelectValue placeholder="Select repository" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  {REPOSITORIES.map((repo) => (
                    <SelectItem key={repo} value={repo}>
                      {repo === "all-repositories" ? "All Repositories" : repo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button 
            onClick={handleSearch} 
            disabled={isLoading || !keyword.trim()}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
            size="lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Searching...
              </>
            ) : (
              <>
                <Search className="mr-2 h-4 w-4" />
                Search Code
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {searchResults && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-foreground">
              Search Results for "{searchResults.keyword}"
            </h2>
            <div className="text-sm text-muted-foreground">
              {searchResults.matches.length} matches found
            </div>
          </div>

          <div className="grid gap-4">
            {searchResults.matches.map((match, index) => (
              <Card key={index} className="border border-border hover:shadow-md transition-all duration-200">
                <CardContent className="p-6">
                  {match.file ? (
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-2">
                          <FileText className="h-4 w-4 text-info" />
                          <button
                            onClick={() => handleRepoClick(match)}
                            className="text-sm font-medium text-info hover:text-info/80 hover:underline cursor-pointer transition-colors"
                          >
                            {match.repo}
                          </button>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <p className="text-sm font-mono text-muted-foreground bg-muted/50 p-2 rounded-md break-all">
                          {match.file}
                        </p>
                        <p className="text-sm text-foreground leading-relaxed">
                          {match.explanation}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <div className="h-2 w-2 bg-success rounded-full"></div>
                        <button
                          onClick={() => handleRepoClick(match)}
                          className="text-sm font-medium text-success hover:text-success/80 hover:underline cursor-pointer transition-colors"
                        >
                          Summary - {match.repo}
                        </button>
                      </div>
                    
                      <p className="text-sm text-foreground leading-relaxed font-medium bg-success/10 p-3 rounded-md">
                        {match.summary}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Code Popup Modal */}
      <CodePopup 
        match={selectedMatch} 
        isOpen={isPopupOpen} 
        onClose={closePopup} 
      />
    </div>
  );
};