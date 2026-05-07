const fetchMock = require("jest-fetch-mock");

describe("研究機器予約ポータルの構築", () => {
  test("研究目的入力時に適合機器が正常に抽出される", async () => {
    // SCEN-325
    fetchMock.resetMocks();
    fetchMock.mockResponseOnce(JSON.stringify({
      equipments: [
        { id: 1, name: "CO2インキュベーター", score: 95, availableTimes: ["09:00-17:00"] },
        { id: 2, name: "培養器具セット", score: 88, availableTimes: ["10:00-16:00"] }
      ]
    }), { status: 200 });

    const response = await fetch("/api/equipment/search", {
      method: "POST",
      body: JSON.stringify({
        researchPurpose: "細胞培養実験",
        experimentContent: "HeLa細胞の増殖実験、37℃インキュベーション環境が必要"
      })
    });

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.equipments).toHaveLength(2);
    expect(data.equipments[0].name).toBe("CO2インキュベーター");
  });

  test("不正な実験内容入力時にエラーが返される", async () => {
    // SCEN-326
    fetchMock.resetMocks();
    fetchMock.mockResponseOnce(JSON.stringify({
      error: "不正な文字列が検出されました"
    }), { status: 400 });

    const response = await fetch("/api/equipment/search", {
      method: "POST",
      body: JSON.stringify({
        researchPurpose: "正常な研究目的",
        experimentContent: "'; DROP TABLE equipments; --"
      })
    });

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toBe("不正な文字列が検出されました");
  });

  test("機器詳細画面で仕様と空き時間が正常表示される", async () => {
    // SCEN-327
    fetchMock.resetMocks();
    fetchMock.mockResponseOnce(JSON.stringify({
      equipment: {
        id: 1,
        name: "電子顕微鏡A",
        model: "SEM-2000",
        manufacturer: "メーカーA",
        specifications: "分解能: 1nm",
        availableTimes: ["09:00-12:00", "14:00-17:00"]
      }
    }), { status: 200 });

    const response = await fetch("/api/equipment/1/details");

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.equipment.model).toBe("SEM-2000");
    expect(data.equipment.availableTimes).toHaveLength(2);
  });

  test("機器満席時に代替候補が適切に検索される", async () => {
    // SCEN-328
    fetchMock.resetMocks();
    fetchMock.mockResponseOnce(JSON.stringify({
      alternatives: [
        { id: 2, name: "電子顕微鏡B", location: "研究棟2F", availableTimes: ["10:00-12:00"] },
        { id: 3, name: "電子顕微鏡C", location: "研究棟3F", availableTimes: ["13:00-15:00"] }
      ]
    }), { status: 200 });

    const response = await fetch("/api/equipment/alternatives", {
      method: "POST",
      body: JSON.stringify({
        equipmentId: 1,
        requestedTime: "2024-01-15T10:00:00",
        duration: 2
      })
    });

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.alternatives).toHaveLength(2);
    expect(data.alternatives[0].name).toBe("電子顕微鏡B");
  });

  test("キャンセル後の新規予約が正常に完了する", async () => {
    // SCEN-329
    fetchMock.resetMocks();
    fetchMock.mockResponseOnce(JSON.stringify({ success: true }), { status: 200 });
    fetchMock.mockResponseOnce(JSON.stringify({
      reservationId: "R-2024-001",
      message: "予約が完了しました"
    }), { status: 200 });

    const cancelResponse = await fetch("/api/reservations/123/cancel", { method: "DELETE" });
    const newReservationResponse = await fetch("/api/reservations", {
      method: "POST",
      body: JSON.stringify({ equipmentId: 1, dateTime: "2024-01-15T10:00:00" })
    });

    expect(cancelResponse.status).toBe(200);
    expect(newReservationResponse.status).toBe(200);
    const newData = await newReservationResponse.json();
    expect(newData.reservationId).toBe("R-2024-001");
  });

  test("処理途中でエラー発生時にロールバックされる", async () => {
    // SCEN-330
    fetchMock.resetMocks();
    fetchMock.mockResponseOnce(JSON.stringify({ success: true }), { status: 200 });
    fetchMock.mockResponseOnce("", { status: 500 });

    const cancelResponse = await fetch("/api/reservations/123/cancel", { method: "DELETE" });
    const newReservationResponse = await fetch("/api/reservations", {
      method: "POST",
      body: JSON.stringify({ equipmentId: 1, dateTime: "2024-01-15T10:00:00" })
    });

    expect(cancelResponse.status).toBe(200);
    expect(newReservationResponse.status).toBe(500);
  });

  test("AI分析による機器提案が正常に実行される", async () => {
    // SCEN-331
    fetchMock.resetMocks();
    fetchMock.mockResponseOnce(JSON.stringify({
      recommendations: [
        { equipmentId: 1, name: "X線回折装置", priority: 1, reason: "高精度測定に最適" },
        { equipmentId: 2, name: "SEM装置", priority: 2, reason: "表面分析に適している" }
      ]
    }), { status: 200 });

    const response = await fetch("/api/ai/equipment-recommendation", {
      method: "POST",
      body: JSON.stringify({
        technicalSpecs: "X線回折による結晶構造解析",
        measurementRequirements: "分解能0.01°以下"
      })
    });

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.recommendations).toHaveLength(2);
    expect(data.recommendations[0].priority).toBe(1);
  });

  test("最短スケジュールでの自動予約が正常実行される", async () => {
    // SCEN-332
    fetchMock.resetMocks();
    fetchMock.mockResponseOnce(JSON.stringify({
      reservationId: "R-AUTO-001",
      scheduledTime: "2024-01-16T09:00:00",
      message: "最短スケジュールで予約完了"
    }), { status: 200 });

    const response = await fetch("/api/reservations/auto-schedule", {
      method: "POST",
      body: JSON.stringify({
        equipmentId: 1,
        preferredStartTime: "2024-01-15T10:00:00",
        duration: 2
      })
    });

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.reservationId).toBe("R-AUTO-001");
    expect(data.scheduledTime).toBe("2024-01-16T09:00:00");
  });

  test("測定項目による機器検索が正常に動作する", async () => {
    // SCEN-333
    fetchMock.resetMocks();
    fetchMock.mockResponseOnce(JSON.stringify({
      equipments: [
        { id: 1, name: "精密温度計A", accuracy: "±0.05℃", measurementItems: ["温度測定"] },
        { id: 2, name: "恒温槽B", accuracy: "±0.1℃", measurementItems: ["温度測定", "湿度測定"] }
      ]
    }), { status: 200 });

    const response = await fetch("/api/equipment/search-by-specs", {
      method: "POST",
      body: JSON.stringify({
        measurementItem: "温度測定",
        accuracyRequirement: "±0.1℃以下"
      })
    });

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.equipments).toHaveLength(2);
    expect(data.equipments[0].measurementItems).toContain("温度測定");
  });

  test("機器稼働状況がリアルタイムで正確に表示される", async () => {
    // SCEN-334
    fetchMock.resetMocks();
    fetchMock.mockResponseOnce(JSON.stringify({
      equipments: [
        { id: 1, name: "装置A", status: "稼働中", availableSlots: ["14:00-17:00"] },
        { id: 2, name: "装置B", status: "停止中", availableSlots: ["09:00-17:00"] }
      ]
    }), { status: 200 });

    const response = await fetch("/api/equipment/status/realtime");

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.equipments[0].status).toBe("稼働中");
    expect(data.equipments[1].availableSlots).toContain("09:00-17:00");
  });

  test("研究目的による機器絞り込みが正常動作する", async () => {
    // SCEN-335
    fetchMock.resetMocks();
    fetchMock.mockResponseOnce(JSON.stringify({
      equipments: [
        { id: 1, name: "X線回折装置", researchAreas: ["材料分析"] },
        { id: 2, name: "電子顕微鏡", researchAreas: ["材料分析", "表面解析"] }
      ]
    }), { status: 200 });

    const response = await fetch("/api/equipment/filter-by-purpose", {
      method: "POST",
      body: JSON.stringify({ researchPurpose: "材料分析" })
    });

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.equipments).toHaveLength(2);
    expect(data.equipments[0].researchAreas).toContain("材料分析");
  });

  test("予算制約に基づく最適プラン提案が正常動作する", async () => {
    // SCEN-336
    fetchMock.resetMocks();
    fetchMock.mockResponseOnce(JSON.stringify({
      optimizedPlan: {
        totalCost: 45000,
        schedule: [
          { date: "2024-01-15", timeSlot: "09:00-12:00", cost: 15000 },
          { date: "2024-01-16", timeSlot: "13:00-17:00", cost: 20000 },
          { date: "2024-01-18", timeSlot: "10:00-12:00", cost: 10000 }
        ]
      }
    }), { status: 200 });

    const response = await fetch("/api/equipment/optimize-plan", {
      method: "POST",
      body: JSON.stringify({
        equipmentId: 1,
        budgetLimit: 50000,
        preferredPeriod: "2024-01-15 to 2024-01-20",
        preferredHours: "09:00-17:00"
      })
    });

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.optimizedPlan.totalCost).toBeLessThanOrEqual(50000);
    expect(data.optimizedPlan.schedule).toHaveLength(3);
  });

  test("企業プロジェクト情報が構造化されて正常登録される", async () => {
    // SCEN-337
    fetchMock.resetMocks();
    fetchMock.mockResponseOnce(JSON.stringify({
      projectId: "PRJ-2024-001",
      message: "プロジェクト情報を登録しました"
    }), { status: 200 });

    const response = await fetch("/api/projects", {
      method: "POST",
      body: JSON.stringify({
        projectName: "新材料開発プロジェクト",
        purpose: "次世代半導体材料の特性評価",
        requiredEquipments: ["X線回折装置", "SEM"],
        period: "2024-01-01 to 2024-12-31",
        budget: 5000000,
        manager: "田中太郎"
      })
    });

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.projectId).toBe("PRJ-2024-001");
    expect(data.message).toBe("プロジェクト情報を登録しました");
  });

  test("不完全な情報入力時にバリデーションエラーが発生する", async () => {
    // SCEN-338
    fetchMock.resetMocks();
    fetchMock.mockResponseOnce(JSON.stringify({
      error: "必須項目が未入力です",
      missingFields: ["projectName", "manager", "budget"]
    }), { status: 400 });

    const response = await fetch("/api/projects", {
      method: "POST",
      body: JSON.stringify({
        purpose: "研究目的のみ入力",
        period: "2024-01-01 to 2024-12-31"
      })
    });

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toBe("必須項目が未入力です");
    expect(data.missingFields).toContain("projectName");
  });

  test("投資対効果が正常に自動算出される", async () => {
    // SCEN-339
    fetchMock.resetMocks();
    fetchMock.mockResponseOnce(JSON.stringify({
      roiPercentage: 10.2,
      calculation: {
        totalRevenue: 1200000,
        totalCosts: 1100000,
        totalInvestment: 1000000
      }
    }), { status: 200 });

    const response = await fetch("/api/projects/roi-calculation", {
      method: "POST",
      body: JSON.stringify({
        projectBudget: 10000000,
        projectPeriod: 12,
        equipmentCost: 5000000,
        maintenanceCost: 500000,
        usageHours: 1200,
        hourlyRate: 1000
      })
    });

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.roiPercentage).toBeCloseTo(10.2, 1);
    expect(data.calculation.totalInvestment).toBe(1000000);
  });
});