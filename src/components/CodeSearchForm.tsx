import { useState } from "react";
import { Search, FileText, GitBranch, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface Match {
  file?: string;
  repo: string;
  explanation?: string;
  summary?: string;
}

interface SearchResponse {
  keyword: string;
  matches: Match[];
}

const REPOSITORIES = [
  "mainserverreports",
  "kapture-report",
  "all-repositories"
];

export const CodeSearchForm = () => {
  const [keyword, setKeyword] = useState("");
  const [selectedRepo, setSelectedRepo] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
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
      // Mock API call - replace with your actual API endpoint
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API delay
      
      // For demo purposes, using the provided sample data
      const mockResponse: SearchResponse = {
        keyword: keyword,
        matches: [
          {
            file: "src/main/java/com/kapture/mainserverreports/enums/GenericTemplate/InternalOrderReport.java",
            repo: "mainserverreports",
            explanation: "This code appears to generate a report in CSV format by taking in reportRequest data. The keyword is used to fetch value from cache service. If this value exists and is not empty, it's transformed into a JSON object."
          },
          {
            file: "src/main/java/com/kapture/mainserverreports/service/GoDownStockReportService.java",
            repo: "mainserverreports",
            explanation: "This code performs a series of operations related to getting certain attributes using the keyword. For an employee's address, it gets zone IDs based on a provided attribute and its value."
          },
          {
            file: "src/main/java/com/kapture/kapturereport/generator/TicketReport.java",
            repo: "kapture-report",
            explanation: "The code is primarily fetching information from a report request and processing it based on conditions. The keyword is used to fetch a string from cache, representing various IDs."
          },
          {
            summary: "This keyword serves as an important identifier for pinpointing, extracting, and processing certain valuable pieces of identification data across the codebase.",
            repo: "mainserverreports"
          }
        ]
      };

      setSearchResults(mockResponse);
      toast({
        title: "Search Complete",
        description: `Found ${mockResponse.matches.length} matches for "${keyword}"`,
      });
    } catch (error) {
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

  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-lg bg-card">
        <CardHeader className="text-center pb-4">
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-info bg-clip-text text-transparent">
            Code Search Tool
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
                          <span className="text-sm font-medium text-info">{match.repo}</span>
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
                        <span className="text-sm font-medium text-success">Summary - {match.repo}</span>
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
    </div>
  );
};