import { checkRateLimit, rateLimitMap, RATE_LIMIT_WINDOW, MAX_REQUESTS } from "./rateLimit";

export function runRateLimitUnitTests() {
  console.log("=== Running Rate Limiter Unit Tests ===");
  const results: { test: string; passed: boolean; message?: string }[] = [];

  // Helper to assert conditions and push result
  function runTest(name: string, fn: () => boolean, message?: string) {
    try {
      const passed = fn();
      results.push({ test: name, passed, message: passed ? undefined : message });
    } catch (e: unknown) {
      results.push({ test: name, passed: false, message: (e as Error).message });
    }
  }

  // Clear map before starting
  rateLimitMap.clear();

  const baseTime = Date.now();

  // Test 1: Happy path - single request allowed
  runTest(
    "Happy path: Initial request is allowed",
    () => {
      const allowed = checkRateLimit("192.168.1.1", baseTime);
      return allowed === true && rateLimitMap.get("192.168.1.1")?.count === 1;
    },
    "Expected checkRateLimit to return true for the first request"
  );

  // Test 2: Counting requests up to the limit
  runTest(
    "Happy path: Multiple requests allowed up to MAX_REQUESTS",
    () => {
      let allAllowed = true;
      for (let i = 2; i <= MAX_REQUESTS; i++) {
        if (!checkRateLimit("192.168.1.1", baseTime)) {
          allAllowed = false;
        }
      }
      return allAllowed && rateLimitMap.get("192.168.1.1")?.count === MAX_REQUESTS;
    },
    `Expected requests up to ${MAX_REQUESTS} to be allowed`
  );

  // Test 3: Exceeding limit
  runTest(
    "Rate limiting: Requests beyond MAX_REQUESTS are blocked",
    () => {
      const allowed = checkRateLimit("192.168.1.1", baseTime);
      return allowed === false;
    },
    "Expected request #11 to be blocked"
  );

  // Test 4: Time window reset
  runTest(
    "Time window reset: After RATE_LIMIT_WINDOW has passed, requests are allowed again",
    () => {
      const futureTime = baseTime + RATE_LIMIT_WINDOW + 1; // 1ms after window expires
      const allowed = checkRateLimit("192.168.1.1", futureTime);
      return allowed === true && rateLimitMap.get("192.168.1.1")?.count === 1;
    },
    "Expected requests to be allowed again after time window expired"
  );

  // Test 5: Garbage collection
  runTest(
    "Garbage collection: Stale entries are removed",
    () => {
      rateLimitMap.clear();

      // Add two entries, one older, one recent
      rateLimitMap.set("old-ip", { count: 5, resetAt: baseTime - 1000 }); // Expired 1 second ago
      rateLimitMap.set("new-ip", { count: 3, resetAt: baseTime + 1000 }); // Expires in 1 second

      // Trigger GC
      checkRateLimit("trigger-ip", baseTime);

      return !rateLimitMap.has("old-ip") && rateLimitMap.has("new-ip") && rateLimitMap.has("trigger-ip");
    },
    "Expected expired entries to be removed from the map during GC"
  );

  // Test 6: Separate IP tracking
  runTest(
    "Separate IP tracking: Limits are applied per IP independently",
    () => {
      rateLimitMap.clear();

      // Exhaust limits for ip1
      for (let i = 0; i < MAX_REQUESTS; i++) {
        checkRateLimit("ip1", baseTime);
      }
      const ip1Blocked = !checkRateLimit("ip1", baseTime);

      // ip2 should still be allowed
      const ip2Allowed = checkRateLimit("ip2", baseTime);

      return ip1Blocked && ip2Allowed;
    },
    "Expected independent rate limiting for different IPs"
  );

  results.forEach(res => {
    if (res.passed) {
      console.log(`??? ${res.test}`);
    } else {
      console.error(`??? ${res.test}\n   ${res.message}`);
    }
  });

  const allPassed = results.every(r => r.passed);
  if (!allPassed) {
    console.error("Some tests failed.");
    process.exitCode = 1;
  } else {
    console.log("=== All Rate Limiter Unit Tests Passed ===");
  }
}

// Automatically run if this script is executed directly
if (require.main === module) {
  runRateLimitUnitTests();
}
