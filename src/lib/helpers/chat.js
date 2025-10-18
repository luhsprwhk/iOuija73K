/**
 * Converts messages with interval delays to cumulative delays
 * @param {Array} messages - Array of message objects with interval delays
 * @returns {Array} - Array of message objects with cumulative delays
 */
export function intervalsToCumulative(messages) {
  let cumulative = 0;
  return messages.map((msg) => {
    cumulative += msg.delay;
    return { ...msg, delay: cumulative };
  });
}
