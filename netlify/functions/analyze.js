// SDK 없이 fetch로 직접 호출

const DIMS = [
  { key: "H", name: "정직-겸손" },
  { key: "E", name: "정서성" },
  { key: "X", name: "외향성" },
  { key: "A", name: "원만성" },
  { key: "C", name: "성실성" },
  { key: "O", name: "개방성" },
];

const FACETS = {
  H: [{ key: "Hs", name: "성실성", en: "Sincerity" }, { key: "Hf", name: "공정성", en: "Fairness" }, { key: "Hg", name: "탐욕 회피", en: "Greed Avoidance" }, { key: "Hm", name: "겸손", en: "Modesty" }],
  E: [{ key: "Ef", name: "두려움", en: "Fearfulness" }, { key: "Ea", name: "불안", en: "Anxiety" }, { key: "Ed", name: "의존성", en: "Dependence" }, { key: "Es", name: "감수성", en: "Sentimentality" }],
  X: [{ key: "Xs", name: "사회적 자존감", en: "Social Self-Esteem" }, { key: "Xb", name: "사회적 대담성", en: "Social Boldness" }, { key: "Xso", name: "사교성", en: "Sociability" }, { key: "Xl", name: "활기", en: "Liveliness" }],
  A: [{ key: "Af", name: "관용", en: "Forgiveness" }, { key: "Ag", name: "온화함", en: "Gentleness" }, { key: "Ax", name: "유연성", en: "Flexibility" }, { key: "Ap", name: "인내심", en: "Patience" }],
  C: [{ key: "Co", name: "체계성", en: "Organization" }, { key: "Cd", name: "근면성", en: "Diligence" }, { key: "Cp", name: "완벽주의", en: "Perfectionism" }, { key: "Cpr", name: "신중성", en: "Prudence" }],
  O: [{ key: "Oa", name: "심미성", en: "Aesthetic Appreciation" }, { key: "Oi", name: "호기심", en: "Inquisitiveness" }, { key: "Ocr", name: "창의성", en: "Creativity" }, { key: "Ouc", name: "비관습성", en: "Unconventionality" }],
};

function lvl(s) {
  if (s >= 4.5) return "매우 높음";
  if (s >= 3.8) return "높음";
  if (s >= 3.2) return "평균";
  if (s >= 2.5) return "낮음";
  return "매우 낮음";
}

function buildPrompt(scores, facets) {
  const hasFacets = Object.keys(facets).length > 0 &&
    Object.values(facets).some(f => Object.keys(f).length > 0);

  const scoreLines = DIMS.map(d =>
    `- ${d.name}(${d.key}): ${scores[d.key].toFixed(2)} [${lvl(scores[d.key])}]`
  ).join("\n");

  let facetLines = "";
  if (hasFacets) {
    facetLines = "\n\n세부 항목:\n" + DIMS.map(d => {
      if (!facets[d.key] || !Object.keys(facets[d.key]).length) return null;
      const rows = FACETS[d.key]
        .map(f => {
          const v = facets[d.key][f.key];
          return v !== undefined ? `  · ${f.name}(${f.en}): ${v.toFixed(2)} [${lvl(v)}]` : null;
        })
        .filter(Boolean).join("\n");
      return rows ? `${d.name}:\n${rows}` : null;
    }).filter(Boolean).join("\n\n");
  }

  const facetJsonPart = hasFacets ? `,
  "facets": {
    "H": {"Hs":"한 줄 해석","Hf":"한 줄 해석","Hg":"한 줄 해석","Hm":"한 줄 해석"},
    "E": {"Ef":"한 줄 해석","Ea":"한 줄 해석","Ed":"한 줄 해석","Es":"한 줄 해석"},
    "X": {"Xs":"한 줄 해석","Xb":"한 줄 해석","Xso":"한 줄 해석","Xl":"한 줄 해석"},
    "A": {"Af":"한 줄 해석","Ag":"한 줄 해석","Ax":"한 줄 해석","Ap":"한 줄 해석"},
    "C": {"Co":"한 줄 해석","Cd":"한 줄 해석","Cp":"한 줄 해석","Cpr":"한 줄 해석"},
    "O": {"Oa":"한 줄 해석","Oi":"한 줄 해석","Ocr":"한 줄 해석","Ouc":"한 줄 해석"}
  }` : "";

  return `당신은 HEXACO 성격 모델 전문 심리 분석가입니다. 20~30대 한국인이 잘 이해할 수 있도록 구어적이고 친근한 문체로, 깊이 있게 분석해주세요.

아래 HEXACO 점수를 바탕으로 JSON만 출력하세요. 마크다운 코드블록이나 다른 텍스트는 절대 포함하지 마세요.

=== 점수 ===
${scoreLines}${facetLines}

=== 분석 지침 ===
1. 점수들을 유기적으로 연결해 분석하세요. 조합의 의미를 서술하세요.
2. 일상생활 예시를 구체적으로 제시하세요 (직장, 친구관계, 연애, SNS, 소비 등 20~30대 삶에 밀접한 장면).
3. 점수의 장점과 주의점을 솔직하게 서술하세요.
4. "~하는 편이에요", "~하기 쉬워요" 같은 자연스러운 문체를 사용하세요.
5. 각 차원 core 설명은 최소 4~5문장, everyday는 3개 이상.
6. 차원 간 상호작용을 반드시 포함하세요.
7. **강조할 단어**는 **로 감싸세요.

=== 출력 JSON ===
{
  "overall": "전체 성격 프로필 요약 (4~6문장)",
  "interaction": "두 가지 이상 차원 조합의 독특한 특성 (3~4문장)",
  "dimensions": {
    "H": { "core": "장단점 포함 4~5문장", "everyday": ["직장 장면","친구/연애 장면","소비/SNS 장면"], "chips": ["키워드1","키워드2","키워드3","키워드4"] },
    "E": { "core": "...", "everyday": ["...","...","..."], "chips": ["..."] },
    "X": { "core": "...", "everyday": ["...","...","..."], "chips": ["..."] },
    "A": { "core": "...", "everyday": ["...","...","..."], "chips": ["..."] },
    "C": { "core": "...", "everyday": ["...","...","..."], "chips": ["..."] },
    "O": { "core": "...", "everyday": ["...","...","..."], "chips": ["..."] }
  }${facetJsonPart}
}`;
}

exports.handler = async (event) => {
  // CORS headers
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Content-Type": "application/json",
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers, body: "" };
  }

  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers, body: JSON.stringify({ error: "Method Not Allowed" }) };
  }

  try {
    const { scores, facets = {} } = JSON.parse(event.body);

    // 유효성 검사
    for (const k of ["H", "E", "X", "A", "C", "O"]) {
      const v = scores[k];
      if (typeof v !== "number" || v < 1 || v > 5) {
        return {
          statusCode: 400, headers,
          body: JSON.stringify({ error: `${k} 점수가 올바르지 않아요 (1~5).` }),
        };
      }
    }

    const prompt = buildPrompt(scores, facets);

    const apiRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 2000,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!apiRes.ok) {
      const errText = await apiRes.text();
      throw new Error(`Anthropic API error ${apiRes.status}: ${errText}`);
    }

    const message = await apiRes.json();
    const raw = (message.content || [])
      .filter(b => b.type === "text")
      .map(b => b.text)
      .join("");

    const clean = raw
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```$/, "")
      .trim();

    const parsed = JSON.parse(clean);
    return { statusCode: 200, headers, body: JSON.stringify(parsed) };

  } catch (err) {
    console.error("Function error:", err);
    return {
      statusCode: 500, headers,
      body: JSON.stringify({ error: "분석 중 오류가 발생했어요. 잠시 후 다시 시도해주세요." }),
    };
  }
};
