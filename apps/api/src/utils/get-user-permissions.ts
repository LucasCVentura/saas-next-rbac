import { defineAbilityFor, Role, userSchema } from '@saas/auth'

export function getUserPermissions(userId: string, role: Role) {
  const authUser = userSchema.parse({
    id: userId,
    role,
  })

  const abbility = defineAbilityFor(authUser)

  return abbility
}
