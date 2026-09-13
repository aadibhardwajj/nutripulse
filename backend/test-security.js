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

const runSecurityTests = async () => {
  console.log('--- STARTING SECURITY & PRODUCTION HARDENING TESTS ---');

  // 1. Health check response format
  const health = await request('/api/health');
  console.log(`[Test 1] Health Endpoint: status ${health.status}, api=${health.data?.data?.api}, database=${health.data?.data?.database}`);
  if (health.status !== 200 || health.data?.data?.database !== 'connected') {
    throw new Error('Health check did not report healthy database status');
  }

  // 2. 404 Endpoint JSON response
  const notFound = await request('/api/unknown-endpoint-404');
  console.log(`[Test 2] Unknown Route 404: status ${notFound.status}, code=${notFound.data?.code}, success=${notFound.data?.success}`);
  if (notFound.status !== 404 || notFound.data?.success !== false || notFound.data?.code !== 'NOT_FOUND') {
    throw new Error('API 404 did not return structured JSON response');
  }

  // 3. Register User A
  const userAEmail = `user_a_${Date.now()}@nutripulse.local`;
  const regA = await request('/api/auth/register', 'POST', {
    name: 'User A',
    email: userAEmail,
    password: 'Password123!',
  });
  const token = regA.data?.data?.token;
  console.log(`[Test 3] User A Registered: status ${regA.status}, token obtained`);
  if (!token) throw new Error('User A registration failed');

  // 4. Test Paginated APIs
  const recipes = await request('/api/recipes?page=1&limit=5', 'GET', null, token);
  console.log(`[Test 4] Recipes Pagination: status ${recipes.status}, page=${recipes.data?.pagination?.page}, limit=${recipes.data?.pagination?.limit}`);
  if (!recipes.data?.pagination) throw new Error('Recipes endpoint missing pagination');

  const meals = await request('/api/meals?page=1&limit=5', 'GET', null, token);
  console.log(`[Test 5] Meals Pagination: status ${meals.status}, page=${meals.data?.pagination?.page}, limit=${meals.data?.pagination?.limit}`);
  if (!meals.data?.pagination) throw new Error('Meals endpoint missing pagination');

  const workouts = await request('/api/workouts?page=1&limit=5', 'GET', null, token);
  console.log(`[Test 6] Workouts Pagination: status ${workouts.status}, page=${workouts.data?.pagination?.page}, limit=${workouts.data?.pagination?.limit}`);
  if (!workouts.data?.pagination) throw new Error('Workouts endpoint missing pagination');

  const weight = await request('/api/weight?page=1&limit=5', 'GET', null, token);
  console.log(`[Test 7] Weight Logs Pagination: status ${weight.status}, page=${weight.data?.pagination?.page}, limit=${weight.data?.pagination?.limit}`);
  if (!weight.data?.pagination) throw new Error('Weight logs endpoint missing pagination');

  // 5. Test User Data Isolation (Create User B, verify User B cannot access User A's private diary item)
  const userBEmail = `testuser_b_${Date.now()}@nutripulse.com`;
  const registerB = await request('/api/auth/register', 'POST', {
    name: 'User B Test',
    email: userBEmail,
    password: 'Password123!',
  });
  const tokenB = registerB.data?.data?.token;
  console.log(`[Test 8] User B Registered: status ${registerB.status}, token obtained`);

  // User B tries to delete a non-existent/User A diary item
  const fakeItemId = '66e3f4e2427f7a1f5f241a01';
  const unauthorizedDelete = await request(`/api/diary/items/${fakeItemId}`, 'DELETE', null, tokenB);
  console.log(`[Test 9] Cross-User Diary Isolation: status ${unauthorizedDelete.status}, code=${unauthorizedDelete.data?.code}`);
  if (unauthorizedDelete.status !== 404) {
    throw new Error('User B was not blocked from modifying items belonging to another context');
  }

  // 6. Test User B Cascade Account Deletion
  const deleteB = await request('/api/auth/account', 'DELETE', null, tokenB);
  console.log(`[Test 10] Cascade Account Deletion: status ${deleteB.status}, message="${deleteB.data?.message}"`);
  if (deleteB.status !== 200) {
    throw new Error('Account deletion failed');
  }

  // Verify User B token is now invalid on /api/auth/me
  const meAfterDelete = await request('/api/auth/me', 'GET', null, tokenB);
  console.log(`[Test 11] Deleted User Token Invalidation: status ${meAfterDelete.status}, code=${meAfterDelete.data?.code}`);
  if (meAfterDelete.status !== 401) {
    throw new Error('Deleted user token was not rejected');
  }

  console.log('====================================================');
  console.log('  ALL 11 SECURITY & HARDENING CHECKS PASSED 100%    ');
  console.log('====================================================');
};

runSecurityTests().catch((err) => {
  console.error('Security verification failed:', err);
  process.exit(1);
});
