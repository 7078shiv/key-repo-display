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

// Enhanced Code Formatter Component
const CodeFormatter = ({ code }: { code: string }) => {
  // Format the code by removing extra whitespace and preserving structure
  const formatCode = (rawCode: string) => {
    return rawCode
      .replace(/\\n/g, '\n')  // Replace escaped newlines with actual newlines
      .replace(/\\t/g, '  ')  // Replace tabs with spaces
      .replace(/\\\"/g, '"')  // Replace escaped quotes
      .replace(/\\\'/g, "'")  // Replace escaped single quotes
      .trim();
  };

  const formattedCode = formatCode(code);

  return (
    <div className="relative">
      <pre className="bg-gray-900 text-gray-100 p-6 rounded-lg overflow-auto text-sm font-mono leading-relaxed border border-gray-700 shadow-inner">
        <code className="block whitespace-pre-wrap break-words">
          {formattedCode}
        </code>
      </pre>
    </div>
  );
};

// Code Popup Modal Component
const CodePopup = ({ match, isOpen, onClose }: { match: Match | null, isOpen: boolean, onClose: () => void }) => {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleCopy = async () => {
    if (match?.code) {
      try {
        // Format the code before copying
        const formattedCode = match.code
          .replace(/\\n/g, '\n')
          .replace(/\\t/g, '  ')
          .replace(/\\\"/g, '"')
          .replace(/\\\'/g, "'")
          .trim();
          
        await navigator.clipboard.writeText(formattedCode);
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
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-card rounded-lg shadow-2xl max-w-6xl w-full max-h-[90vh] flex flex-col border border-border">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border bg-card/95">
          <div className="flex items-center space-x-3">
            <FileText className="h-6 w-6 text-blue-500" />
            <div>
              <h3 className="text-xl font-semibold text-foreground">{match.repo}</h3>
              {match.file && (
                <p className="text-sm text-muted-foreground font-mono truncate max-w-md">
                  {match.file}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-3">
            {match.code && (
              <Button
                onClick={handleCopy}
                variant="outline"
                size="sm"
                className="flex items-center space-x-2 hover:bg-green-50 hover:border-green-300"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4 text-green-600" />
                    <span className="text-green-600">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    <span>Copy Code</span>
                  </>
                )}
              </Button>
            )}
            <Button
              onClick={onClose}
              variant="ghost"
              size="sm"
              className="h-9 w-9 p-0 hover:bg-red-50"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6 bg-gray-50">
          {match.file && (
            <div className="mb-6">
              <Label className="text-sm font-semibold text-gray-700 mb-2 block">File Path:</Label>
              <div className="bg-white p-3 rounded-md border border-gray-200 shadow-sm">
                <p className="text-sm font-mono text-gray-800 break-all">
                  {match.file}
                </p>
              </div>
            </div>
          )}
          
          {match.code ? (
            <div>
              <Label className="text-sm font-semibold text-gray-700 mb-3 block flex items-center">
                <FileText className="h-4 w-4 mr-2" />
                Code Content:
              </Label>
              <div className="rounded-lg overflow-hidden shadow-lg border border-gray-300">
                <CodeFormatter code={match.code} />
              </div>
            </div>
          ) : match.summary ? (
            <div>
              <Label className="text-sm font-semibold text-gray-700 mb-3 block">Summary:</Label>
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <p className="text-gray-800 leading-relaxed">{match.summary}</p>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <FileText className="h-16 w-16 mx-auto mb-4 opacity-30" />
              <p className="text-lg">No code content available for this match</p>
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
      const response = await fetch('https://partnerresource-info-tracker.onrender.com/analyze/v2', {
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
    <div className="space-y-6 min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6">
      <Card className="border-0 shadow-xl bg-white/95 backdrop-blur-sm">
        <CardHeader className="text-center pb-6">
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Partner Resource Search Tool
          </CardTitle>
          <CardDescription className="text-gray-600 text-lg">
            Search for keywords across your repositories and get detailed explanations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <Label htmlFor="keyword" className="text-sm font-semibold text-gray-700">
                Search Keyword
              </Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  id="keyword"
                  type="text"
                  placeholder="e.g., BCCD_SIC_DESIGNATION_ID"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="pl-11 h-12 text-base border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label htmlFor="repository" className="text-sm font-semibold text-gray-700">
                Repository
              </Label>
              <Select value={selectedRepo} onValueChange={setSelectedRepo}>
                <SelectTrigger className="w-full h-12 border-gray-300 focus:border-blue-500">
                  <div className="flex items-center">
                    <GitBranch className="h-5 w-5 mr-3 text-gray-400" />
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
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white h-12 text-lg font-semibold shadow-lg transform transition-all duration-200 hover:scale-105"
            size="lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                Searching...
              </>
            ) : (
              <>
                <Search className="mr-3 h-5 w-5" />
                Search Code
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {searchResults && (
        <div className="space-y-6">
          <div className="flex items-center justify-between bg-white/80 backdrop-blur-sm p-4 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-gray-800">
              Search Results for "{searchResults.keyword}"
            </h2>
            <div className="text-sm text-gray-600 bg-blue-100 px-3 py-1 rounded-full font-medium">
              {searchResults.matches.length} matches found
            </div>
          </div>

          <div className="grid gap-4">
            {searchResults.matches.map((match, index) => (
              <Card key={index} className="border border-gray-200 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 bg-white/95">
                <CardContent className="p-6">
                  {match.file ? (
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <FileText className="h-5 w-5 text-blue-500" />
                          <button
                            onClick={() => handleRepoClick(match)}
                            className="text-base font-semibold text-blue-600 hover:text-blue-800 hover:underline cursor-pointer transition-colors"
                          >
                            {match.repo}
                          </button>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="bg-gray-100 p-3 rounded-md border">
                          <p className="text-sm font-mono text-gray-700 break-all">
                            {match.file}
                          </p>
                        </div>
                        <p className="text-gray-700 leading-relaxed">
                          {match.explanation}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <div className="h-3 w-3 bg-green-500 rounded-full shadow-sm"></div>
                        <button
                          onClick={() => handleRepoClick(match)}
                          className="text-base font-semibold text-green-600 hover:text-green-800 hover:underline cursor-pointer transition-colors"
                        >
                          Summary - {match.repo}
                        </button>
                      </div>
                    
                      <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                        <p className="text-gray-800 leading-relaxed font-medium">
                          {match.summary}
                        </p>
                      </div>
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