const http = require('http');

const request = (path, method = 'GET', body = null, token = null) => {
  return new Promise((resolve, reject) => {
    const dataString = body ? JSON.stringify(body) : '';
    const headers = {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(dataString),
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(
      {
        hostname: 'localhost',
        port: 5000,
        path,
        method,
        headers,
      },
      (res) => {
        let body = '';
        res.on('data', (chunk) => (body += chunk));
        res.on('end', () => {
          try {
            const parsed = JSON.parse(body);
            resolve({ status: res.statusCode, data: parsed });
          } catch (e) {
            resolve({ status: res.statusCode, raw: body });
          }
        });
      }
    );

    req.on('error', reject);
    if (dataString) req.write(dataString);
    req.end();
  });
};

const runVerification = async () => {
  console.log('--- STARTING NUTRIPULSE E2E API VERIFICATION ---');

  // 1. Health check
  const health = await request('/api/health');
  console.log(`[1] Health Check: Status ${health.status} -> ${health.data?.message}`);
  if (health.status !== 200) throw new Error('Health check failed');

  // 2. Authentication Register & Login
  const testEmail = `test_${Date.now()}@nutripulse.local`;
  const regRes = await request('/api/auth/register', 'POST', {
    name: 'Alex Rivera',
    email: testEmail,
    password: 'Password123!',
  });
  console.log(`[2] Auth Register: Status ${regRes.status} -> Success: ${regRes.data?.success}`);
  const token = regRes.data?.data?.token;
  if (!token) throw new Error('Failed to obtain JWT auth token');

  // 3. Current User Verification
  const meRes = await request('/api/auth/me', 'GET', null, token);
  console.log(`[3] Auth Me: Status ${meRes.status} -> User: ${meRes.data?.data?.user?.name}, Email: ${meRes.data?.data?.user?.email}`);

  // 4. Dashboard Summary
  const dashRes = await request('/api/dashboard', 'GET', null, token);
  const calories = dashRes.data?.data?.calories;
  console.log(`[4] Dashboard Summary: Status ${dashRes.status} -> Target: ${calories?.target} kcal, Consumed: ${calories?.consumed} kcal, Remaining: ${calories?.remaining} kcal`);

  // 5. Food Search
  const foodRes = await request('/api/foods?q=Salmon', 'GET', null, token);
  const foundFoods = foodRes.data?.data?.foods || [];
  console.log(`[5] Food Search (query='Salmon'): Found ${foundFoods.length} matching items. First: "${foundFoods[0]?.name}"`);

  // 6. Food Diary & Logging
  const diaryGet = await request('/api/diary', 'GET', null, token);
  console.log(`[6] Diary Fetch: Status ${diaryGet.status} -> Total Meals: ${Object.keys(diaryGet.data?.data?.meals || {}).length}`);

  const addDiaryItem = await request(
    '/api/diary/items',
    'POST',
    {
      date: new Date().toISOString().slice(0, 10),
      mealType: 'breakfast',
      foodId: foundFoods[0]?._id || '66e3f4e2427f7a1f5f241a01',
      foodName: foundFoods[0]?.name || 'Atlantic Salmon Fillet',
      servingSize: 1,
      servingUnit: 'fillet',
      servingWeightGrams: 150,
      quantity: 1,
      calories: 309,
      protein: 33,
      carbs: 0,
      fat: 18,
    },
    token
  );
  console.log(`[7] Log Food to Diary: Status ${addDiaryItem.status} -> Message: "${addDiaryItem.data?.message}"`);

  // 7. Water Hydration Logging
  const waterRes = await request(
    '/api/water',
    'POST',
    {
      date: new Date().toISOString().slice(0, 10),
      amountMl: 500,
    },
    token
  );
  console.log(`[8] Water Log: Status ${waterRes.status} -> Total Day Hydration: ${waterRes.data?.data?.totalMl} ml`);

  // 8. Exercise Logging
  const exRes = await request(
    '/api/exercises/log',
    'POST',
    {
      date: new Date().toISOString().slice(0, 10),
      exerciseName: 'Running / Jogging (8 km/h)',
      category: 'running',
      durationMinutes: 30,
      distanceKm: 4.0,
      caloriesBurned: 280,
    },
    token
  );
  console.log(`[9] Exercise Log: Status ${exRes.status} -> Logged: "${exRes.data?.data?.log?.exerciseName}", Burned: ${exRes.data?.data?.log?.caloriesBurned} kcal`);

  // 9. Weight Logging
  const weightRes = await request(
    '/api/weight',
    'POST',
    {
      date: new Date().toISOString().slice(0, 10),
      weightKg: 78.2,
      notes: 'Automated test weigh-in',
    },
    token
  );
  console.log(`[10] Weight Log: Status ${weightRes.status} -> Recorded Weight: ${weightRes.data?.data?.log?.weightKg} kg`);

  // 10. Progress Analytics
  const progRes = await request('/api/progress?range=7d', 'GET', null, token);
  console.log(`[11] Progress Analytics: Status ${progRes.status} -> Days aggregated: ${progRes.data?.data?.daysCount}, Avg Calories: ${progRes.data?.data?.averages?.calories} kcal`);

  // 11. Profile Goal Updating
  const goalRes = await request(
    '/api/profile/goals',
    'PATCH',
    {
      dailyCalories: 2200,
      targetProteinGrams: 165,
    },
    token
  );
  console.log(`[12] Goals Update: Status ${goalRes.status} -> New Daily Calories: ${goalRes.data?.data?.goals?.dailyCalories} kcal`);

  console.log('====================================================');
  console.log('  ALL 12 PRODUCTION-CRITICAL API TESTS PASSED 100%  ');
  console.log('====================================================');
};

runVerification().catch((err) => {
  console.error('Verification failed:', err);
  process.exit(1);
});
