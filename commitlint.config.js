export default {
  ignores: [(message) => message.startsWith("Squashed commit")],
  extends: ["@commitlint/config-conventional"],
};
