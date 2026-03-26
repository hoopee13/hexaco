exports.handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Content-Type": "application/json"
  };
  if (event.httpMethod === "OPTIONS") return { statusCode: 204, headers, body: "" };
  if (event.httpMethod !== "POST") return { statusCode: 405, headers, body: JSON.stringify({ error: "Method Not Allowed" }) };
  try {
    const { scores, facets = {} } = JSON.parse(event.body);
    const DIMS = [
      { key: "H", name: "정직-겸손" }, { key: "E", name: "정서성" },
      { key: "X", name: "외향성" }, { key: "A", name: "원만성" },
      { key: "C", name: "성실성" }, { key: "O", name: "개방성" }
    ];
    function lvl(s) {
      if (s >= 4.5) return "매우 높음";
      if (s >= 3.8) return "높음";
      if (s >= 3.2) return "평균";
      if (s >= 2.5) return "낮음";
      return "매우 낮음";
    }
    const scoreLines = DIMS.map(d => "- " + d.name + "(" + d.key + "): " + scores[d.key].toFixed(2) + " [" + lvl(scores[d.key]) + "]").join("\n");
    const prompt = "당신은 HEXACO 성격 모델 전문 심리 분석가입니다. 20~30대 한국인이 잘 이해할 수 있도록 구어적이고 친근한 문체로 깊이 있게 분석해주세요.\n\n아래 HEXACO 점수를 바탕으로 JSON만 출력하세요. 마크다운 코드블록이나 다른 텍스트는 절대 포함하지 마세요.\n\n점수:\n" + scoreLines + "\n\n분석 지침:\n1. 점수들을 유기적으로 연결해 분석하세요.\n2. 일상생활 예시를 구체적으로 제시하세요 (직장, 친구관계, 연애, SNS, 소비 등 20~30대 삶에 밀접한 장면).\n3. 점수의 장점과 주의점을 솔직하게 서술하세요.\n4. 자연스러운 문체를 사용하세요.\n5. 각 차원 core 설명은 최소 4~5문장, everyday는 3개 이상.\n6. 차원 간 상호작용을 반드시 포함하세요.\n\n출력 JSON:\n{\n  \"overall\": \"전체 성격 프로필 요약 4~6문장\",\n  \"interaction\": \"차원 조합의 독특한 특성 3~4문장\",\n  \"dimensions\": {\n    \"H\": { \"core\": \"장단점 포함 4~5문장\", \"everyday\": [\"직장 장면\",\"친구/연애 장면\",\"소비/SNS 장면\"], \"chips\": [\"키워드1\",\"키워드2\",\"키워드3\",\"키워드4\"] },\n    \"E\": { \"core\": \"...\", \"everyday\": [\"...\",\"...\",\"...\"], \"chips\": [\"...\"] },\n    \"X\": { \"core\": \"...\", \"everyday\": [\"...\",\"...\",\"...\"], \"chips\": [\"...\"] },\n    \"A\": { \"core\": \"...\", \"everyday\": [\"...\",\"...\",\"...\"], \"chips\": [\"...\"] },\n    \"C\": { \"core\": \"...\", \"everyday\": [\"...\",\"...\",\"...\"], \"chips\": [\"...\"] },\n    \"O\": { \"core\": \"...\", \"everyday\": [\"...\",\"...\",\"...\"], \"chips\": [\"...\"] }\n  }\n}";
    const apiRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 2000, messages: [{ role: "user", content: prompt }] })
    });
    if (!apiRes.ok) { const t = await apiRes.text(); throw new Error("API error " + apiRes.status + ": " + t); }
    const msg = await apiRes.json();
    const raw = (msg.content || []).filter(b => b.type === "text").map(b => b.text).join("");
    const clean = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
    const parsed = JSON.parse(clean);
    return { statusCode: 200, headers, body: JSON.stringify(parsed) };
  } catch (err) {
    console.error("Error:", err.message);
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};
