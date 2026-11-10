export async function safeQuery<T>(
  fallback: T,
  query: () => Promise<T>,
): Promise<T> {
  try {
    return await query();
  } catch (error) {
    console.error(error);
    return fallback;
  }
}
