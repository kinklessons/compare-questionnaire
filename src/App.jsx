import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronDown } from "lucide-react";
import questionsV3 from "@/questionnaires/v3.json";

function decodeSharedUrl(url) {
  try {
    const params = new URL(url).searchParams;
    const encoded = params.get("data");
    if (!encoded) return null;
    return JSON.parse(atob(encoded));
  } catch {
    return null;
  }
}

export default function CompareApp() {
  const [url1, setUrl1] = useState("");
  const [url2, setUrl2] = useState("");
  const [openCategories, setOpenCategories] = useState({});

  const data1 = useMemo(() => decodeSharedUrl(url1), [url1]);
  const data2 = useMemo(() => decodeSharedUrl(url2), [url2]);

  const results = useMemo(() => {
    if (!data1 || !data2) return null;

    const categories = {};
    const mutual = [];
    const conflicts = [];

    let overallTotal = 0;

    questionsV3.forEach((q) => {
      const a = Number(data1.answers?.[q.id] ?? 1);
      const b = Number(data2.answers?.[q.id] ?? 1);

      const similarity = 100 - (Math.abs(a - b) / 4) * 100;
      overallTotal += similarity;

      if (!categories[q.Category]) {
        categories[q.Category] = {
          questions: [],
          total: 0,
          count: 0,
        };
      }

      categories[q.Category].questions.push({
        ...q,
        scoreA: a,
        scoreB: b,
        similarity,
      });

      categories[q.Category].total += similarity;
      categories[q.Category].count++;

      if (a >= 4 && b >= 4) {
        mutual.push({ ...q, scoreA: a, scoreB: b });
      }

      if ((a >= 4 && b <= 2) || (b >= 4 && a <= 2)) {
        conflicts.push({ ...q, scoreA: a, scoreB: b });
      }
    });

    const categoryResults = Object.entries(categories)
      .map(([name, data]) => ({
        name,
        score: Math.round(data.total / data.count),
        questions: data.questions.sort(
          (x, y) => y.similarity - x.similarity
        ),
      }))
      .sort((a, b) => b.score - a.score);

    return {
      overall: Math.round(overallTotal / questionsV3.length),
      categoryResults,
      mutual,
      conflicts,
    };
  }, [data1, data2]);

  const toggleCategory = (category) => {
    setOpenCategories((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-slate-200 p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-4xl font-bold"  style={{ color: "#000000" }}>
            Kink Questionnaire Comparison
          </h1>
          <p className="text-slate-600 mt-2">
            Compare two shared questionnaire URLs
          </p>
        </div>

        <Card>
          <CardContent className="p-6 space-y-4">
            <Input
              placeholder="First shared URL"
              value={url1}
              onChange={(e) => setUrl1(e.target.value)}
            />

            <Input
              placeholder="Second shared URL"
              value={url2}
              onChange={(e) => setUrl2(e.target.value)}
            />
          </CardContent>
        </Card>

        {results && (
          <>
            <Card>
              <CardContent className="p-6">
                <div className="text-sm text-slate-600">
                  Overall Compatibility
                </div>
                <div className="text-5xl font-bold">
                  {results.overall}%
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold mb-4"  style={{ color: "#000000" }}>
                  🔥 Mutual Interests ({results.mutual.length})
                </h2>

                <div className="space-y-2">
                  {results.mutual.map((item) => (
                    <div
                      key={item.id}
                      className="border-b pb-2"
                    >
                      <div className="font-medium">
                        {item.Question}
                      </div>
                      <div className="text-sm text-slate-500">
                        {item.Category}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold mb-4"  style={{ color: "#000000" }}>
                  ⚠ Conflicts ({results.conflicts.length})
                </h2>

                <div className="space-y-2">
                  {results.conflicts.map((item) => (
                    <div
                      key={item.id}
                      className="border-b pb-2"
                    >
                      <div className="font-medium">
                        {item.Question}
                      </div>
                      <div className="text-sm text-slate-500">
                        A: {item.scoreA} | B: {item.scoreB}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold mb-4"  style={{ color: "#000000" }}>
                  Category Compatibility
                </h2>

                {results.categoryResults.map((category) => (
                  <div
                    key={category.name}
                    className="mb-4 border rounded-xl"
                  >
                    <button
                      className="w-full flex items-center justify-between p-4"
                      onClick={() =>
                        toggleCategory(category.name)
                      }
                    >
                      <div className="font-bold">
                        {category.name}
                      </div>

                      <div className="flex items-center gap-4">
                        <span>{category.score}%</span>

                        <ChevronDown
                          className={`transition-transform ${
                            openCategories[category.name]
                              ? "rotate-180"
                              : ""
                          }`}
                        />
                      </div>
                    </button>

                    {openCategories[category.name] && (
                      <div className="p-4 border-t space-y-2">
                        {category.questions.map((q) => (
                          <div
                            key={q.id}
                            className="flex justify-between border-b pb-2"
                          >
                            <div>{q.Question}</div>

                            <div className="text-sm">
                              A:{q.scoreA} B:{q.scoreB} (
                              {Math.round(q.similarity)}%)
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
