import Role from "../model/Role.js";
import { StatusCodes } from "http-status-codes";

// @desc    Create new Role
// @route   POST /api/v1/roles
// @access  Private/Master
export const createRolesController = async (req, res) => {
  const { name, description } = req.body;

  try {
    const newRole = new Role({
      name: name,
      description: description,
    });
    const result = await newRole.save();
    res.status(StatusCodes.OK);
    res.json({
      status: "success",
      message: "Role created successfully",
      result,
    });
  } catch (err) {
    res.status(StatusCodes.NOT_FOUND).json({ message: err.message });
  }
};

// @desc    Get all role
// @route   GET /api/v1/roles
// @access  Private/admin
export const getAllRoles = async (req, res) => {
  try {
    const roles =await Role.find();
    res.status(StatusCodes.OK).json({
      status: "success",
      message: "All roles retrieved successfully",
      roles,
    });
  } catch (err) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: err.message });
  }
};
