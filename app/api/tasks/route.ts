import { NextResponse } from 'next/server';

import { listTasks, createTask } from '@/lib/tasks';
import { createTaskSchema } from '@/lib/validators/task';

export async function GET(): Promise<NextResponse> {
  try {
    const tasks = await listTasks();
    return NextResponse.json({ tasks }, { status: 200 });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body: unknown = await request.json();
    const result = createTaskSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: result.error.errors.map((e) => ({
            field: e.path.join('.'),
            message: e.message,
          })),
        },
        { status: 400 },
      );
    }

    const task = await createTask(result.data);
    return NextResponse.json({ task }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
