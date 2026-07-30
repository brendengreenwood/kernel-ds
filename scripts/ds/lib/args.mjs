/** Minimal deterministic flag parser: --key value pairs and boolean --flags. */
export function parseFlags(argv, booleanFlags = []) {
  const flags = {}
  const positional = []
  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index]
    if (!token.startsWith("--")) {
      positional.push(token)
      continue
    }
    const name = token.slice(2)
    if (booleanFlags.includes(name) || index + 1 >= argv.length || argv[index + 1].startsWith("--")) {
      flags[name] = true
    } else {
      flags[name] = argv[index + 1]
      index += 1
    }
  }
  return { flags, positional }
}

export function requireFlags(flags, names, commandName) {
  const missing = names.filter((name) => flags[name] === undefined || flags[name] === true)
  if (missing.length > 0) {
    console.error(`DS-USAGE: ${commandName} requires ${missing.map((name) => `--${name} <value>`).join(" ")}`)
    process.exitCode = 1
    return false
  }
  return true
}
