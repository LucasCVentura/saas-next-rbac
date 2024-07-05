import { z } from 'zod'

import { organizationSchema } from '../models/organization'

export const organizationSubject = z.tuple([
  z.union([
    z.literal('manage'),
    z.literal('update'),
    z.literal('delete'),
    z.literal('trasnfer_ownership'),
  ]),
  z.union([z.literal('Organization'), organizationSchema]),
])

export type organizationSubject = z.infer<typeof organizationSubject>
