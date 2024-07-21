import { projectSchema } from '@saas/auth'
import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'

import { prisma } from '@/lib/prisma'
import { getUserPermissions } from '@/utils/get-user-permissions'

import { auth } from '../../midlewares/auth'
import { BadRequestError } from '../_errors/bad-request-error'

export async function deleteProject(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .delete(
      '/organizations/:slug/projects/:projectId',
      {
        schema: {
          tags: ['projects'],
          summary: 'Delete a project',
          security: [{ bearerAuth: [] }],
          params: z.object({
            slug: z.string(),
            projectId: z.string(),
          }),
          response: {
            204: z.null(),
          },
        },
      },
      async (request, reply) => {
        const { slug, projectId } = request.params

        const userId = await request.getCurrentUserId()
        const { membership } = await request.getUserMembership(slug)

        const project = await prisma.project.findUnique({
          where: {
            id: projectId,
          },
        })

        if (!project) {
          throw new BadRequestError('This project does not exist')
        }
        const { cannot } = getUserPermissions(userId, membership.role)
        const authProject = projectSchema.parse({
          id: project.id,
          ownerId: project.userId,
        })

        if (cannot('delete', authProject)) {
          throw new BadRequestError(
            'You are not allowed to delete this project',
          )
        }

        await prisma.project.delete({
          where: {
            id: projectId,
          },
        })

        return reply.status(204).send()
      },
    )
}
