import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
export class Todo {
  static async create(data) {
    try {
      return await prisma.todo.create({ data });
    } catch (error) {
      throw new Error(`Error creating todo: ${error.message}`);
    }
  }

  static async findById(id) {
    try {
      return await prisma.todo.findUnique({
        where: { id },
      });
    } catch (error) {
      throw new Error(`Error finding todo by id: ${error.message}`);
    }
  }

  static async update(id, data) {
    try {
      return await prisma.todo.update({
        where: { id },
        data,
      });
    } catch (error) {
      throw new Error(`Error updating todo: ${error.message}`);
    }
  }

  static async delete(id) {
    try {
      return await prisma.todo.delete({
        where: { id },
      });
    } catch (error) {
      throw new Error(`Error deleting todo: ${error.message}`);
    }
  }

  static async findAll(filter) {
    try {
      const { take, skip, ...rest } = filter;
      console.log(rest);
      var todos = await prisma.todo.findMany({
        take,
        skip,
        where: {
          ...rest,
        },
      });
      var totalCount = await prisma.todo.count({
        where: {
          ...rest,
        },
      });
      return { todos, totalCount };
    } catch (error) {
      throw new Error(`Error finding todos: ${error.message}`);
    }
  }
}
