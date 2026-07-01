import axios from 'axios';

const BASE_URL = 'http://localhost:3000/api';
const client = axios.create({
  baseURL: BASE_URL,
  timeout: 60000,
  validateStatus: () => true,
});

interface TestResult {
  name: string;
  passed: boolean;
  statusCode: number;
  expectedCode: number;
  error?: string;
}

const results: TestResult[] = [];

async function testEndpoint(name: string, method: 'GET' | 'POST', path: string, data?: any, expectedStatus: number = 200): Promise<void> {
  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`📝 TEST: ${name}`);

  try {
    const response = await client({ method, url: path, data });
    const passed = response.status === expectedStatus;
    results.push({ name, passed, statusCode: response.status, expectedCode: expectedStatus, error: response.data?.error });

    if (passed) {
      console.log(`✅ PASS - Status ${response.status}`);
    } else {
      console.log(`❌ FAIL - Expected ${expectedStatus}, got ${response.status}`);
      console.log(`Error: ${response.data?.error || 'No error message'}`);
    }
  } catch (err: any) {
    results.push({ name, passed: false, statusCode: 0, expectedCode: expectedStatus, error: err.message });
    console.log(`❌ ERROR - ${err.message}`);
  }
}

async function runTests() {
  console.log(`\n╔═══════════════════════════════════════════════════════════╗`);
  console.log(`║   AI SOCIAL MEDIA AUTOMATION - PHASE 2 TEST SUITE        ║`);
  console.log(`╚═══════════════════════════════════════════════════════════╝`);

  await testEndpoint('Publish Facebook Content', 'POST', '/publish', { topic: 'AI content strategy', platform: 'facebook' }, 200);
  await testEndpoint('Publish Instagram Content', 'POST', '/publish', { topic: 'AI content strategy', platform: 'instagram' }, 200);
  await testEndpoint('Schedule Facebook Content', 'POST', '/publish', { topic: 'AI content strategy', platform: 'facebook', scheduleFor: new Date(Date.now() + 60000).toISOString() }, 200);
  await testEndpoint('Get Published Posts', 'GET', '/published', undefined, 200);
  await testEndpoint('Get Scheduled Posts', 'GET', '/scheduled', undefined, 200);

  const passed = results.filter((t) => t.passed).length;
  const failed = results.length - passed;

  console.log(`\n╔═══════════════════════════════════════════════════════════╗`);
  console.log(`║                    TEST SUMMARY                          ║`);
  console.log(`╠═══════════════════════════════════════════════════════════╣`);
  console.log(`║ ✅ PASSED: ${passed.toString().padEnd(2)}                                        ║`);
  console.log(`║ ❌ FAILED: ${failed.toString().padEnd(2)}                                        ║`);
  console.log(`║ 📊 TOTAL:  ${results.length.toString().padEnd(2)}                                        ║`);
  console.log(`╚═══════════════════════════════════════════════════════════╝`);

  if (failed > 0) process.exit(1);
  process.exit(0);
}

runTests().catch((err) => {
  console.error('Test suite error:', err);
  process.exit(1);
});
