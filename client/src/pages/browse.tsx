import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { PastPaper } from "@shared/schema";
import { CartItem } from "@/App";
import { GRADES, SUBJECTS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import PastPaperCard from "@/components/past-paper-card";
import { Search, Filter } from "lucide-react";

interface BrowseProps {
  onAddToCart: (item: CartItem) => void;
  onBuyNow: (item: CartItem) => void;
}

export default function Browse({ onAddToCart, onBuyNow }: BrowseProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGrades, setSelectedGrades] = useState<string[]>([]);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("newest");
  const [priceRange, setPriceRange] = useState<string>("");

  const { data: papers = [], isLoading } = useQuery<PastPaper[]>({
    queryKey: ["/api/past-papers"],
  });

  const handleBuyNow = (item: CartItem) => {
    onBuyNow(item);
  };

  const handleGradeChange = (grade: string, checked: boolean) => {
    if (checked) {
      setSelectedGrades(prev => [...prev, grade]);
    } else {
      setSelectedGrades(prev => prev.filter(g => g !== grade));
    }
  };

  const handleSubjectChange = (subject: string, checked: boolean) => {
    if (checked) {
      setSelectedSubjects(prev => [...prev, subject]);
    } else {
      setSelectedSubjects(prev => prev.filter(s => s !== subject));
    }
  };

  // Filter and sort papers
  const filteredPapers = papers.filter(paper => {
    const matchesSearch = paper.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         paper.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGrade = selectedGrades.length === 0 || selectedGrades.includes(paper.grade);
    const matchesSubject = selectedSubjects.length === 0 || selectedSubjects.includes(paper.subject);
    
    let matchesPrice = true;
    if (priceRange === "50-100") {
      matchesPrice = paper.price >= 50 && paper.price <= 100;
    } else if (priceRange === "100-200") {
      matchesPrice = paper.price >= 100 && paper.price <= 200;
    } else if (priceRange === "200+") {
      matchesPrice = paper.price >= 200;
    }

    return matchesSearch && matchesGrade && matchesSubject && matchesPrice;
  });

  const sortedPapers = [...filteredPapers].sort((a, b) => {
    switch (sortBy) {
      case "price-low":
        return a.price - b.price;
      case "price-high":
        return b.price - a.price;
      case "title":
        return a.title.localeCompare(b.title);
      default: // newest
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-kenyan-green"></div>
          <p className="mt-4 text-gray-600">Loading past papers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-16 bg-gray-50" data-testid="page-browse">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4" data-testid="text-browse-title">
            Browse Past Papers
          </h1>
          <p className="text-xl text-gray-600" data-testid="text-browse-description">
            Find the perfect past papers for your grade level
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search past papers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 py-3 text-lg"
              data-testid="input-search"
            />
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-4 lg:gap-8">
          {/* Filters Sidebar */}
          <div className="lg:w-64 bg-white p-4 lg:p-6 rounded-xl shadow-sm h-fit" data-testid="filters-sidebar">
            <div className="flex items-center mb-6">
              <Filter className="w-5 h-5 mr-2" />
              <h3 className="text-lg font-semibold">Filters</h3>
            </div>

            {/* Grade Filter */}
            <div className="mb-4 lg:mb-6">
              <h4 className="font-semibold mb-3">Grade Level</h4>
              <div className="space-y-2 max-h-32 lg:max-h-48 overflow-y-auto">
                {GRADES.map((grade) => {
                  const count = papers.filter(p => p.grade === grade).length;
                  return (
                    <div key={grade} className="flex items-center space-x-2">
                      <Checkbox
                        id={`grade-${grade}`}
                        checked={selectedGrades.includes(grade)}
                        onCheckedChange={(checked) => handleGradeChange(grade, checked as boolean)}
                        data-testid={`checkbox-grade-${grade.toLowerCase().replace(' ', '-')}`}
                      />
                      <Label
                        htmlFor={`grade-${grade}`}
                        className="text-sm cursor-pointer flex-1"
                      >
                        {grade}
                      </Label>
                      <span className="text-xs bg-gray-100 px-2 py-1 rounded">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Subject Filter */}
            <div className="mb-4 lg:mb-6">
              <h4 className="font-semibold mb-3">Subject</h4>
              <div className="space-y-2">
                {SUBJECTS.map((subject) => {
                  const count = papers.filter(p => p.subject === subject).length;
                  return (
                    <div key={subject} className="flex items-center space-x-2">
                      <Checkbox
                        id={`subject-${subject}`}
                        checked={selectedSubjects.includes(subject)}
                        onCheckedChange={(checked) => handleSubjectChange(subject, checked as boolean)}
                        data-testid={`checkbox-subject-${subject.toLowerCase().replace(' ', '-')}`}
                      />
                      <Label
                        htmlFor={`subject-${subject}`}
                        className="text-sm cursor-pointer flex-1"
                      >
                        {subject}
                      </Label>
                      <span className="text-xs bg-gray-100 px-2 py-1 rounded">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Price Range Filter */}
            <div className="mb-4 lg:mb-6">
              <h4 className="font-semibold mb-3">Price Range</h4>
              <div className="space-y-2">
                {[
                  { value: "", label: "All Prices" },
                  { value: "50-100", label: "KSh 50 - 100" },
                  { value: "100-200", label: "KSh 100 - 200" },
                  { value: "200+", label: "KSh 200+" },
                ].map((range) => (
                  <div key={range.value} className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id={`price-${range.value}`}
                      name="priceRange"
                      value={range.value}
                      checked={priceRange === range.value}
                      onChange={(e) => setPriceRange(e.target.value)}
                      className="text-kenyan-green focus:ring-kenyan-green"
                      data-testid={`radio-price-${range.value || 'all'}`}
                    />
                    <Label
                      htmlFor={`price-${range.value}`}
                      className="text-sm cursor-pointer"
                    >
                      {range.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Clear Filters */}
            <Button
              variant="outline"
              onClick={() => {
                setSelectedGrades([]);
                setSelectedSubjects([]);
                setPriceRange("");
                setSearchTerm("");
              }}
              className="w-full"
              data-testid="button-clear-filters"
            >
              Clear All Filters
            </Button>
          </div>

          {/* Papers Grid */}
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div className="text-sm sm:text-base text-gray-600" data-testid="text-results-count">
                Showing {sortedPapers.length} of {papers.length} past papers
              </div>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full sm:w-64" data-testid="select-sort">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Sort by: Newest</SelectItem>
                  <SelectItem value="price-low">Sort by: Price (Low to High)</SelectItem>
                  <SelectItem value="price-high">Sort by: Price (High to Low)</SelectItem>
                  <SelectItem value="title">Sort by: Title</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {sortedPapers.length === 0 ? (
              <div className="text-center py-12" data-testid="empty-results">
                <div className="text-gray-500 mb-4">
                  <Search className="w-16 h-16 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No past papers found</h3>
                  <p>Try adjusting your filters or search terms</p>
                </div>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="papers-grid">
                {sortedPapers.map((paper) => (
                  <PastPaperCard
                    key={paper.id}
                    paper={paper}
                    onAddToCart={onAddToCart}
                    onBuyNow={handleBuyNow}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
