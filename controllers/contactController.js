import { StatusCodes } from "http-status-codes";
import Contact from "../model/Contact.js";
import { isEmailValid } from "../utils/validate.js";

// @desc    Create new contact
// @route   POST /api/v1/contact/
// @access  Public
export const createContact = async (req, res) => {
  try {
    const { fullName, email, content } = req.body;
    if (!isEmailValid(email)) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ status: "fail", message: "Invalid email" });
    }

    const newContact = new Contact({
      fullName,
      email,
      content,
    });
    const contact = await newContact.save();
    res.status(StatusCodes.OK).json({
      status: "success",
      message: "Contact created successfully",
      contact,
    });
  } catch (err) {
    res.status(StatusCodes.NOT_FOUND).json({ message: err.message });
  }
};

// @desc    Get all contacts
// @route   GET /api/v1/contact/
// @access  Private/Admin
export const getAllContacts = async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    res.status(StatusCodes.OK).json({
      status: "success",
      message: "All contacts retrieved successfully",
      contacts,
    });
  } catch (err) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      status: "fail",
      message: err.message,
    });
  }
};

export const resolveMultipleContacts = async (req, res) => {
  const { contactIds } = req.body;

  try {
    // Update contacts with pending status to resolved
    await Contact.updateMany(
      { _id: { $in: contactIds }, status: "pending" },
      { status: "resolved" }
    );

    res.status(StatusCodes.OK).json({
      status: "success",
      message: "Contacts resolved successfully",
    });
  } catch (err) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      status: "fail",
      message: err.message,
    });
  }
};

export const deleteMultipleContacts = async (req, res) => {
  const { contactIds } = req.body;

  try {
    await Contact.deleteMany({ _id: { $in: contactIds } });

    res.status(StatusCodes.OK).json({
      status: "success",
      message: "Contacts deleted successfully",
    });
  } catch (err) {
    console.log(err.message);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ status: "fail", message: err.message });
  }
};
