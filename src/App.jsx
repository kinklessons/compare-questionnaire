import { useState } from "react";
#import { Card, CardContent } from "@/components/ui/card";
#import { Button } from "@/components/ui/button";
#import { Input } from "@/components/ui/input";

// Import your question list

import questionSets from "./questions";
const questions = questionSets["2.0"];
function decodeAnswers(str) {
  try {
    return JSON.parse(atob(str));
  } catch {
    return null;
  }
}

function getStatus(a, b) {
  const diff = Math.abs(a - b);

  if (
    (a === 1 && b >= 4) ||
    (b === 1 && a >= 4)
  ) {
    return "Hard Limit";
  }

  if (diff <= 1) {
    return "Match";
  }

  if (diff === 2) {
    return "Discuss";
  }

  return "Conflict";
}

function buildComparison(personA, personB) {
  const answersA = personA.answers || {};
  const answersB = personB.answers || {};

  let totalScore = 0;
  let count = 0;

  const matches = [];
  const discussions = [];
  const conflicts = [];
  const hardLimits = [];
  const rows = [];

  Object.keys(answersA).forEach((key) => {
    if (!(key in answersB)) return;

    const index = Number(key.replace("q", ""));

    const a = Number(answersA[key]);
    const b = Number(answersB[key]);

    const diff = Math.abs(a - b);

    totalScore += (4 - diff) / 4;
    count++;

    const row = {
      question: questionsv2[index] || key,
      a,
      b,
      diff,
      status: getStatus(a, b),
    };

    rows.push(row);

    switch (row.status) {
      case "Match":
        matches.push(row);
        break;

      case "Discuss":
        discussions.push(row);
        break;

      case "Conflict":
        conflicts.push(row);
        break;

      case "Hard Limit":
        hardLimits.push(row);
        break;

      default:
        break;
    }
  });

  const compatibility =
    count > 0
      ? Math.round((totalScore / count) * 100)
      : 0;

  return {
    compatibility,
    matches,
    discussions,
    conflicts,
    hardLimits,
    rows,
  };
}

export default function App() {
  const [urlA, setUrlA] = useState("");
  const [urlB, setUrlB] = useState("");
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  const compare = () => {
    setError("");

    try {
      const parsedA = new URL(urlA);
      const parsedB = new URL(urlB);

      const dataA = parsedA.searchParams.get("data");
      const dataB = parsedB.searchParams.get("data");

      if (!dataA || !dataB) {
        setError("One or both URLs do not contain questionnaire data.");
        return;
      }

      const personA = decodeAnswers(dataA);
      const personB = decodeAnswers(dataB);

      if (!personA || !personB) {
        setError("Unable to decode one of the questionnaires.");
        return;
      }

      if (personA.version !== personB.version) {
        setError(
          `Version mismatch: ${personA.version} vs ${personB.version}`
        );
        return;
      }

      setResult(buildComparison(personA, personB));
    } catch {
      setError("Invalid URL entered.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">

        <div className="text-center">
          <h1 className="text-4xl font-bold">
            Kink Compatibility Comparison
          </h1>

          <p className="text-slate-600 mt-2">
            Compare two questionnaire results
          </p>
        </div>

        <Card>
          <CardContent className="p-6 space-y-4">

            <div>
              <label className="font-medium">
                Partner A URL
              </label>

              <Input
                value={urlA}
                onChange={(e) =>
                  setUrlA(e.target.value)
                }
                placeholder="Paste Partner A questionnaire URL"
              />
            </div>

            <div>
              <label className="font-medium">
                Partner B URL
              </label>

              <Input
                value={urlB}
                onChange={(e) =>
                  setUrlB(e.target.value)
                }
                placeholder="Paste Partner B questionnaire URL"
              />
            </div>

            <Button
              onClick={compare}
              className="w-full"
            >
              Compare Results
            </Button>

            {error && (
              <div className="text-red-600">
                {error}
              </div>
            )}
          </CardContent>
        </Card>

        {result && (
          <>
            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="text-sm text-slate-500">
                    Compatibility Score
                  </div>

                  <div className="text-6xl font-bold">
                    {result.compatibility}%
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid md:grid-cols-2 gap-6">

              <Card>
                <CardContent className="p-6">
                  <h2 className="font-bold text-xl mb-4">
                    Shared Interests
                  </h2>

                  <ul className="space-y-2">
                    {result.matches.map((item) => (
                      <li key={item.question}>
                        {item.question}
                        {" "}
                        ({item.a}/{item.b})
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <h2 className="font-bold text-xl mb-4">
                    Discussion Areas
                  </h2>

                  <ul className="space-y-2">
                    {result.discussions.map((item) => (
                      <li key={item.question}>
                        {item.question}
                        {" "}
                        ({item.a}/{item.b})
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <h2 className="font-bold text-xl mb-4 text-red-600">
                    Hard Limits
                  </h2>

                  <ul className="space-y-2">
                    {result.hardLimits.map((item) => (
                      <li key={item.question}>
                        {item.question}
                        {" "}
                        ({item.a}/{item.b})
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <h2 className="font-bold text-xl mb-4">
                    Conflicts
                  </h2>

                  <ul className="space-y-2">
                    {result.conflicts.map((item) => (
                      <li key={item.question}>
                        {item.question}
                        {" "}
                        ({item.a}/{item.b})
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

            </div>

            <Card>
              <CardContent className="p-6 overflow-x-auto">
                <h2 className="font-bold text-xl mb-4">
                  Full Comparison
                </h2>

                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">
                        Question
                      </th>
                      <th className="p-2">
                        A
                      </th>
                      <th className="p-2">
                        B
                      </th>
                      <th className="p-2">
                        Status
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {result.rows.map((row) => (
                      <tr
                        key={row.question}
                        className="border-b"
                      >
                        <td className="p-2">
                          {row.question}
                        </td>

                        <td className="text-center">
                          {row.a}
                        </td>

                        <td className="text-center">
                          {row.b}
                        </td>

                        <td className="text-center">
                          {row.status}
                        </td>
                      </tr>
                    ))}
                  </tbody>

                </table>
              </CardContent>
            </Card>

          </>
        )}
      </div>
    </div>
  );
}

