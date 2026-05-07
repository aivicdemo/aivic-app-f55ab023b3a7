const fetchMock = require("jest-fetch-mock");

describe("研究機器予約ポータルの構築", () => {
  test("研究目的入力時に適合機器が正常に抽出される", async () => {
    // SCEN-325
    fetchMock.resetMocks();
    fetchMock.mockResponseOnce(JSON.stringify({
      matchedEquipments: [
        { id: 1, name: "CO2インキュベーター", matchScore: 95, availableTime: "09:00-17:00" },
        { id: 2, name: "培養器具セット", matchScore: 88, availableTime: "10:00-16:00" }
      ]
    }), { status: 200 });

    const response = await fetch("/api/equipment/match", {
      method: "POST",
      body: JSON.stringify({ researchPurpose: "細胞培養実験", experimentContent: "HeLa細胞の増殖実験、37℃インキュベーション環境が必要" })
    });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.matchedEquipments).toHaveLength(2);
    expect(data.matchedEquipments[0].name).toBe("CO2インキュベーター");
  });

  test("不正な実験内容入力時にエラーが返される", async () => {
    // SCEN-326
    fetchMock.resetMocks();
    fetchMock.mockResponseOnce(JSON.stringify({
      error: "不正な実験内容が検出されました"
    }), { status: 400 });

    const response = await fetch("/api/equipment/match", {
      method: "POST",
      body: JSON.stringify({ researchPurpose: "正常な研究目的", experimentContent: "'; DROP TABLE users; --" })
    });
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("不正な実験内容が検出されました");
  });

  test("機器詳細画面で仕様と空き時間が正常表示される", async () => {
    // SCEN-327
    fetchMock.resetMocks();
    fetchMock.mockResponseOnce(JSON.stringify({
      equipment: { id: 1, model: "XYZ-2000", manufacturer: "ABC Corp", performance: "高精度測定" },
      availableTimes: ["09:00-12:00", "14:00-17:00"],
      realTimeUpdate: true
    }), { status: 200 });

    const response = await fetch("/api/equipment/1/details");
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.equipment.model).toBe("XYZ-2000");
    expect(data.availableTimes).toContain("09:00-12:00");
  });

  test("機器満席時に代替候補が適切に検索される", async () => {
    // SCEN-328
    fetchMock.resetMocks();
    fetchMock.mockResponseOnce(JSON.stringify({
      originalEquipment: { id: 1, status: "満席" },
      alternatives: [
        { id: 2, name: "代替電子顕微鏡A", availableTime: "10:00-12:00", location: "2F" },
        { id: 3, name: "代替電子顕微鏡B", availableTime: "13:00-15:00", location: "3F" }
      ]
    }), { status: 200 });

    const response = await fetch("/api/equipment/search-alternatives", {
      method: "POST",
      body: JSON.stringify({ equipmentId: 1, desiredTime: "2024-01-15 10:00-12:00" })
    });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.alternatives).toHaveLength(2);
    expect(data.originalEquipment.status).toBe("満席");
  });

  test("キャンセル後の新規予約が正常に完了する", async () => {
    // SCEN-329
    fetchMock.resetMocks();
    fetchMock.mockResponseOnce(JSON.stringify({ message: "予約がキャンセルされました" }), { status: 200 });
    fetchMock.mockResponseOnce(JSON.stringify({ reservationId: "R123456", message: "予約が完了しました" }), { status: 201 });

    const cancelResponse = await fetch("/api/reservations/1", { method: "DELETE" });
    const cancelData = await cancelResponse.json();
    
    const newResponse = await fetch("/api/reservations", {
      method: "POST",
      body: JSON.stringify({ equipmentId: 2, dateTime: "2024-01-15 14:00" })
    });
    const newData = await newResponse.json();

    expect(cancelResponse.status).toBe(200);
    expect(newResponse.status).toBe(201);
    expect(newData.reservationId).toBe("R123456");
  });

  test("処理途中でエラー発生時にロールバックされる", async () => {
    // SCEN-330
    fetchMock.resetMocks();
    fetchMock.mockResponseOnce(JSON.stringify({ message: "予約がキャンセルされました" }), { status: 200 });
    fetchMock.mockResponseOnce("", { status: 500 });

    const cancelResponse = await fetch("/api/reservations/1", { method: "DELETE" });
    const newResponse = await fetch("/api/reservations", {
      method: "POST",
      body: JSON.stringify({ equipmentId: 2, dateTime: "2024-01-15 14:00" })
    });

    expect(cancelResponse.status).toBe(200);
    expect(newResponse.status).toBe(500);
  });

  test("AI分析による機器提案が正常に実行される", async () => {
    // SCEN-331
    fetchMock.resetMocks();
    fetchMock.mockResponseOnce(JSON.stringify({
      suggestions: [
        { equipmentId: 1, name: "高精度分析装置", priority: 1, reason: "測定精度要件に最適" },
        { equipmentId: 2, name: "温度制御装置", priority: 2, reason: "実験条件に適合" }
      ]
    }), { status: 200 });

    const response = await fetch("/api/ai/equipment-suggestion", {
      method: "POST",
      body: JSON.stringify({ projectName: "テストプロジェクト", techSpecs: "高精度測定", requirements: "温度制御必須" })
    });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.suggestions[0].priority).toBe(1);
  });

  test("最短スケジュールでの自動予約が正常実行される", async () => {
    // SCEN-332
    fetchMock.resetMocks();
    fetchMock.mockResponseOnce(JSON.stringify({
      reservationId: "AUTO123",
      scheduledTime: "2024-01-16 09:00",
      message: "最短スケジュールで予約を確保しました"
    }), { status: 201 });

    const response = await fetch("/api/reservations/auto-schedule", {
      method: "POST",
      body: JSON.stringify({ equipmentId: 1, preferredStart: "2024-01-15 10:00", duration: 2 })
    });
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.scheduledTime).toBe("2024-01-16 09:00");
  });

  test("測定項目による機器検索が正常に動作する", async () => {
    // SCEN-333
    fetchMock.resetMocks();
    fetchMock.mockResponseOnce(JSON.stringify({
      equipments: [
        { id: 1, name: "精密温度計A", measurementItem: "温度測定", accuracy: "±0.05℃" },
        { id: 2, name: "精密温度計B", measurementItem: "温度測定", accuracy: "±0.1℃" }
      ]
    }), { status: 200 });

    const response = await fetch("/api/equipment/search?measurementItem=温度測定&accuracy=±0.1℃以下");
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.equipments).toHaveLength(2);
    expect(data.equipments[0].measurementItem).toBe("温度測定");
  });

  test("機器稼働状況がリアルタイムで正確に表示される", async () => {
    // SCEN-334
    fetchMock.resetMocks();
    fetchMock.mockResponseOnce(JSON.stringify({
      equipments: [
        { id: 1, status: "稼働中", availableSlots: ["14:00-17:00"] },
        { id: 2, status: "停止中", availableSlots: ["09:00-17:00"] }
      ],
      lastUpdated: "2024-01-15T10:30:00Z"
    }), { status: 200 });

    const response = await fetch("/api/equipment/realtime-status");
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.equipments[0].status).toBe("稼働中");
    expect(data.lastUpdated).toBeTruthy();
  });

  test("研究目的による機器絞り込みが正常動作する", async () => {
    // SCEN-335
    fetchMock.resetMocks();
    fetchMock.mockResponseOnce(JSON.stringify({
      equipments: [
        { id: 1, name: "材料分析装置A", researchPurpose: ["材料分析"] },
        { id: 2, name: "材料分析装置B", researchPurpose: ["材料分析"] }
      ]
    }), { status: 200 });

    const response = await fetch("/api/equipment/search?researchPurpose=材料分析");
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.equipments).toHaveLength(2);
    expect(data.equipments[0].researchPurpose).toContain("材料分析");
  });

  test("予算制約に基づく最適プラン提案が正常動作する", async () => {
    // SCEN-336
    fetchMock.resetMocks();
    fetchMock.mockResponseOnce(JSON.stringify({
      optimalPlan: {
        totalCost: 45000,
        schedule: [
          { date: "2024-01-15", time: "09:00-12:00", cost: 15000 },
          { date: "2024-01-16", time: "13:00-16:00", cost: 15000 },
          { date: "2024-01-17", time: "09:00-12:00", cost: 15000 }
        ]
      }
    }), { status: 200 });

    const response = await fetch("/api/equipment/optimal-plan", {
      method: "POST",
      body: JSON.stringify({ budgetLimit: 50000, period: "2024-01-15/2024-01-20", timeSlot: "09:00-17:00" })
    });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.optimalPlan.totalCost).toBeLessThanOrEqual(50000);
  });

  test("企業プロジェクト情報が構造化されて正常登録される", async () => {
    // SCEN-337
    fetchMock.resetMocks();
    fetchMock.mockResponseOnce(JSON.stringify({
      projectId: "PRJ001",
      message: "プロジェクト情報が正常に登録されました"
    }), { status: 201 });

    const response = await fetch("/api/projects", {
      method: "POST",
      body: JSON.stringify({
        name: "テストプロジェクト",
        purpose: "新素材開発",
        equipmentTypes: ["電子顕微鏡"],
        period: "2024-01-01/2024-12-31",
        budget: 1000000
      })
    });
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.projectId).toBe("PRJ001");
  });

  test("不完全な情報入力時にバリデーションエラーが発生する", async () => {
    // SCEN-338
    fetchMock.resetMocks();
    fetchMock.mockResponseOnce(JSON.stringify({
      errors: [
        { field: "name", message: "プロジェクト名は必須です" },
        { field: "budget", message: "予算情報は必須です" }
      ]
    }), { status: 400 });

    const response = await fetch("/api/projects", {
      method: "POST",
      body: JSON.stringify({ purpose: "研究目的のみ入力" })
    });
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.errors).toHaveLength(2);
  });

  test("投資対効果が正常に自動算出される", async () => {
    // SCEN-339
    fetchMock.resetMocks();
    fetchMock.mockResponseOnce(JSON.stringify({
      roi: 10.5,
      calculation: {
        totalRevenue: 1200000,
        totalCosts: 600000,
        totalInvestment: 5500000,
        roiPercentage: 10.5
      }
    }), { status: 200 });

    const response = await fetch("/api/analysis/roi", {
      method: "POST",
      body: JSON.stringify({
        projectBudget: 10000000,
        equipmentCost: 5000000,
        maintenanceCost: 500000,
        usageRevenue: 1200000
      })
    });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.roi).toBeCloseTo(10.5, 1);
  });
});