// Validates req.body (or query) against a zod schema; replaces it with parsed data.
export const validate = (schema, source = 'body') => (req, res, next) => {
  const result = schema.safeParse(req[source]);
  if (!result.success) {
    const issues = result.error.issues.map((i) => ({
      field: i.path.join('.'),
      message: i.message,
    }));
    return res.status(400).json({ message: issues[0]?.message || 'Invalid input', issues });
  }
  req[source === 'body' ? 'body' : 'validatedQuery'] = result.data;
  next();
};
