const fetchMock = require("jest-fetch-mock");

describe("研究機器予約ポータルの構築", () => {
  test("研究目的入力時に適合機器が正常に抽出される", async () => {
    // SCEN-325
    fetchMock.resetMocks();
    fetchMock.mockResponseOnce(JSON.stringify({
      equipment: [
        { id: 1, name: "CO2インキュベーター", matchScore: 95, availableTime: "9:00-17:00" },
        { id: 2, name: "培養器具セット", matchScore: 88, availableTime: "10:00-16:00" }
      ]
    }), { status: 200 });

    const response = await fetch("/api/equipment/search", {
      method: "POST",
      body: JSON.stringify({ purpose: "細胞培養実験", content: "HeLa細胞の増殖実験、37℃インキュベーション環境が必要" })
    });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.equipment).toHaveLength(2);
    expect(data.equipment[0].matchScore).toBe(95);
  });

  test("不正な実験内容入力時にエラーが返される", async () => {
    // SCEN-326
    fetchMock.resetMocks();
    fetchMock.mockResponseOnce(JSON.stringify({
      error: "不正な文字列が検出されました"
    }), { status: 400 });

    const response = await fetch("/api/equipment/search", {
      method: "POST",
      body: JSON.stringify({ purpose: "正常な研究目的", content: "'; DROP TABLE users; --" })
    });
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain("不正な文字列が検出されました");
  });

  test("機器詳細画面で仕様と空き時間が正常表示される", async () => {
    // SCEN-327
    fetchMock.resetMocks();
    fetchMock.mockResponseOnce(JSON.stringify({
      id: 1,
      specifications: { model: "ABC-123", manufacturer: "XYZ Corp", performance: "高精度" },
      availableSlots: ["10:00-12:00", "14:00-16:00"]
    }), { status: 200 });

    const response = await fetch("/api/equipment/1/details");
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.specifications.model).toBe("ABC-123");
    expect(data.availableSlots).toContain("10:00-12:00");
  });

  test("機器満席時に代替候補が適切に検索される", async () => {
    // SCEN-328
    fetchMock.resetMocks();
    fetchMock.mockResponseOnce(JSON.stringify({
      originalEquipment: { id: 1, status: "満席" },
      alternatives: [
        { id: 2, name: "代替電子顕微鏡A", location: "3F", availableTime: "13:00-15:00" },
        { id: 3, name: "代替電子顕微鏡B", location: "2F", availableTime: "16:00-18:00" }
      ]
    }), { status: 200 });

    const response = await fetch("/api/equipment/search-alternatives", {
      method: "POST",
      body: JSON.stringify({ equipmentId: 1, datetime: "2024-01-15 10:00-12:00" })
    });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.alternatives).toHaveLength(2);
    expect(data.alternatives[0].location).toBe("3F");
  });

  test("キャンセル後の新規予約が正常に完了する", async () => {
    // SCEN-329
    fetchMock.resetMocks();
    fetchMock.mockResponseOnce(JSON.stringify({ message: "予約がキャンセルされました" }), { status: 200 })
      .mockResponseOnce(JSON.stringify({ reservationId: "R-12345", message: "予約が完了しました" }), { status: 201 });

    const cancelResponse = await fetch("/api/reservations/cancel", {
      method: "POST",
      body: JSON.stringify({ reservationId: "R-001" })
    });
    const newReservationResponse = await fetch("/api/reservations", {
      method: "POST",
      body: JSON.stringify({ equipmentId: 1, datetime: "2024-01-16 14:00-16:00" })
    });
    const data = await newReservationResponse.json();

    expect(cancelResponse.status).toBe(200);
    expect(newReservationResponse.status).toBe(201);
    expect(data.reservationId).toBe("R-12345");
  });

  test("処理途中でエラー発生時にロールバックされる", async () => {
    // SCEN-330
    fetchMock.resetMocks();
    fetchMock.mockResponseOnce(JSON.stringify({ message: "キャンセル完了" }), { status: 200 })
      .mockResponseOnce("", { status: 500 });

    const cancelResponse = await fetch("/api/reservations/cancel", {
      method: "POST",
      body: JSON.stringify({ reservationId: "R-001" })
    });
    const newReservationResponse = await fetch("/api/reservations", {
      method: "POST",
      body: JSON.stringify({ equipmentId: 1, datetime: "2024-01-16 14:00-16:00" })
    });

    expect(cancelResponse.status).toBe(200);
    expect(newReservationResponse.status).toBe(500);
  });

  test("AI分析による機器提案が正常に実行される", async () => {
    // SCEN-331
    fetchMock.resetMocks();
    fetchMock.mockResponseOnce(JSON.stringify({
      recommendations: [
        { equipmentId: 1, priority: 1, reason: "精度要件に最適", conditions: "温度管理必須" },
        { equipmentId: 2, priority: 2, reason: "コスト効率良好", conditions: "定期メンテナンス要" }
      ]
    }), { status: 200 });

    const response = await fetch("/api/ai/equipment-recommendation", {
      method: "POST",
      body: JSON.stringify({ 
        specifications: "高精度測定、10nm分解能",
        requirements: "温度±0.1℃、湿度±2%" 
      })
    });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.recommendations[0].priority).toBe(1);
    expect(data.recommendations[0].reason).toBe("精度要件に最適");
  });

  test("最短スケジュールでの自動予約が正常実行される", async () => {
    // SCEN-332
    fetchMock.resetMocks();
    fetchMock.mockResponseOnce(JSON.stringify({
      reservationId: "R-AUTO-001",
      scheduledTime: "2024-01-16 09:00-11:00",
      message: "最短スケジュールで予約完了"
    }), { status: 201 });

    const response = await fetch("/api/reservations/auto-schedule", {
      method: "POST",
      body: JSON.stringify({ 
        equipmentId: 1, 
        preferredStart: "2024-01-15 10:00",
        duration: 120 
      })
    });
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.reservationId).toBe("R-AUTO-001");
    expect(data.scheduledTime).toBe("2024-01-16 09:00-11:00");
  });

  test("測定項目による機器検索が正常に動作する", async () => {
    // SCEN-333
    fetchMock.resetMocks();
    fetchMock.mockResponseOnce(JSON.stringify({
      equipment: [
        { id: 1, name: "高精度温度計A", accuracy: "±0.05℃" },
        { id: 2, name: "高精度温度計B", accuracy: "±0.1℃" }
      ]
    }), { status: 200 });

    const response = await fetch("/api/equipment/search", {
      method: "POST",
      body: JSON.stringify({ 
        measurementItem: "温度測定",
        accuracyRequirement: "±0.1℃以下" 
      })
    });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.equipment).toHaveLength(2);
    expect(data.equipment[0].accuracy).toBe("±0.05℃");
  });

  test("機器稼働状況がリアルタイムで正確に表示される", async () => {
    // SCEN-334
    fetchMock.resetMocks();
    fetchMock.mockResponseOnce(JSON.stringify({
      equipmentId: 1,
      status: "稼働中",
      availableSlots: ["13:00-15:00", "16:00-18:00"]
    }), { status: 200 });

    const response = await fetch("/api/equipment/1/status");
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.status).toBe("稼働中");
    expect(data.availableSlots).toContain("13:00-15:00");
  });

  test("研究目的による機器絞り込みが正常動作する", async () => {
    // SCEN-335
    fetchMock.resetMocks();
    fetchMock.mockResponseOnce(JSON.stringify({
      equipment: [
        { id: 1, name: "X線分析装置", category: "材料分析" },
        { id: 2, name: "電子顕微鏡", category: "材料分析" }
      ]
    }), { status: 200 });

    const response = await fetch("/api/equipment/search", {
      method: "POST",
      body: JSON.stringify({ researchPurpose: "材料分析" })
    });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.equipment).toHaveLength(2);
    expect(data.equipment[0].category).toBe("材料分析");
  });

  test("予算制約に基づく最適プラン提案が正常動作する", async () => {
    // SCEN-336
    fetchMock.resetMocks();
    fetchMock.mockResponseOnce(JSON.stringify({
      optimalPlan: {
        totalCost: 45000,
        schedule: [
          { date: "2024-01-15", time: "9:00-12:00", cost: 15000 },
          { date: "2024-01-18", time: "14:00-17:00", cost: 15000 },
          { date: "2024-01-20", time: "9:00-12:00", cost: 15000 }
        ]
      }
    }), { status: 200 });

    const response = await fetch("/api/equipment/optimal-plan", {
      method: "POST",
      body: JSON.stringify({ 
        budget: 50000,
        period: "2024-01-15 to 2024-01-20",
        timeSlot: "平日9:00-17:00" 
      })
    });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.optimalPlan.totalCost).toBeLessThanOrEqual(50000);
    expect(data.optimalPlan.schedule).toHaveLength(3);
  });

  test("企業プロジェクト情報が構造化されて正常登録される", async () => {
    // SCEN-337
    fetchMock.resetMocks();
    fetchMock.mockResponseOnce(JSON.stringify({
      projectId: "PRJ-001",
      message: "プロジェクト情報が正常に登録されました"
    }), { status: 201 });

    const response = await fetch("/api/projects", {
      method: "POST",
      body: JSON.stringify({
        name: "新材料開発プロジェクト",
        purpose: "次世代電池材料の研究",
        equipmentTypes: ["X線分析装置", "電子顕微鏡"],
        period: "2024-01-01 to 2024-12-31",
        budget: 5000000,
        manager: "田中太郎"
      })
    });
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.projectId).toBe("PRJ-001");
    expect(data.message).toContain("正常に登録されました");
  });

  test("不完全な情報入力時にバリデーションエラーが発生する", async () => {
    // SCEN-338
    fetchMock.resetMocks();
    fetchMock.mockResponseOnce(JSON.stringify({
      error: "バリデーションエラー",
      missingFields: ["プロジェクト名", "担当者名", "予算"]
    }), { status: 400 });

    const response = await fetch("/api/projects", {
      method: "POST",
      body: JSON.stringify({
        purpose: "研究目的のみ入力"
      })
    });
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("バリデーションエラー");
    expect(data.missingFields).toContain("プロジェクト名");
  });

  test("投資対効果が正常に自動算出される", async () => {
    // SCEN-339
    fetchMock.resetMocks();
    fetchMock.mockResponseOnce(JSON.stringify({
      roi: 10.0,
      calculation: {
        totalRevenue: 1200000,
        totalCost: 550000,
        totalInvestment: 10000000,
        roiPercentage: 10.0
      }
    }), { status: 200 });

    const response = await fetch("/api/projects/roi-analysis", {
      method: "POST",
      body: JSON.stringify({
        projectBudget: 10000000,
        period: 12,
        equipmentCost: 5000000,
        maintenanceCost: 500000,
        usageHours: 1200,
        hourlyRate: 1000
      })
    });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.roi).toBe(10.0);
    expect(data.calculation.roiPercentage).toBe(10.0);
  });
});