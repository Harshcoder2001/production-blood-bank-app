const mongoose = require("mongoose");
const inventoryModel = require("../models/inventoryModel");
const userModel = require("../models/userModel");

//CREATE INVENTORY
// const createInventoryController = async (req, res) => {
//   try {
//     const { email } = req.body;
//     //validation
//     const user = await userModel.findOne({ email });
//     if (!user) {
//       throw new Error("User Not Found");
//     }
//     //if (inventoryType === "in" && user.role !== "donar") {
//     // throw new Error("Not a donar account");
//     //}
//     // if (inventoryType === "out" && user.role !== "hospital") {
//     // throw new Error("Not a hospital");
//     //}

//     if (req.body.inventoryType == "out") {
//       const requestedBloodGroup = req.body.bloodGroup;
//       const requestedQuantityOfBlood = req.body.quantity;
//       const organisation = new mongoose.Types.ObjectId(req.body.userId);
//       //calculate Blood Quantity
//       const totalInOfRequestedBlood = await inventoryModel.aggregate([
//         {
//           $match: {
//             organisation,
//             inventoryType: "in",
//             bloodGroup: requestedBloodGroup,
//           },
//         },
//         {
//           $group: {
//             _id: "$bloodGroup",
//             total: { $sum: "$quantity" },
//           },
//         },
//       ]);
//       // console.log("Total In", totalInOfRequestedBlood);
//       const totalIn = totalInOfRequestedBlood[0]?.total || 0;
//       //calculate OUT Blood Quantity

//       const totalOutOfRequestedBloodGroup = await inventoryModel.aggregate([
//         {
//           $match: {
//             organisation,
//             inventoryType: "out",
//             bloodGroup: requestedBloodGroup,
//           },
//         },
//         {
//           $group: {
//             _id: "$bloodGroup",
//             total: { $sum: "$quantity" },
//           },
//         },
//       ]);
//       const totalOut = totalOutOfRequestedBloodGroup[0]?.total || 0;

//       //in & Out Calculations
//       const availableQuantityOfBloodGroup = totalIn - totalOut;
//       //quantity validtion
//       if (availableQuantityOfBloodGroup < requestedQuantityOfBlood) {
//         return res.status(500).send({
//           success: false,
//           message: `Only ${availableQuantityOfBloodGroup}ML of ${requestedBloodGroup.toUpperCase()} is available`,
//         });
//       }
//       req.body.hospital = user?._id;
//     } else {
//       req.body.donar = user?._id;
//     }

//     //save record
//     const inventory = new inventoryModel(req.body);
//     await inventory.save();
//     return res.status(201).send({
//       success: true,
//       message: "New Blood Record Added",
//     });
//   } catch (error) {
//     console.log(error);
//     return res.status(500).send({
//       success: false,
//       message: "Error In Create Inventory API",
//       error,
//     });
//   }
// };
const createInventoryController = async (req, res) => {
  try {
    const { email } = req.body;

    // Validation - Find the user by email
    const user = await userModel.findOne({ email });
    if (!user) {
      throw new Error("User Not Found");
    }

    // Inventory logic based on inventoryType ("in" or "out")
    if (req.body.inventoryType == "out") {
      const requestedBloodGroup = req.body.bloodGroup;
      const requestedQuantityOfBlood = req.body.quantity;
      const organisation = new mongoose.Types.ObjectId(req.body.userId);

      // Calculate available "in" blood quantity
      const totalInOfRequestedBlood = await inventoryModel.aggregate([
        {
          $match: {
            organisation,
            inventoryType: "in",
            bloodGroup: requestedBloodGroup,
          },
        },
        {
          $group: {
            _id: "$bloodGroup",
            total: { $sum: "$quantity" },
          },
        },
      ]);
      const totalIn = totalInOfRequestedBlood[0]?.total || 0;

      // Calculate "out" blood quantity
      const totalOutOfRequestedBloodGroup = await inventoryModel.aggregate([
        {
          $match: {
            organisation,
            inventoryType: "out",
            bloodGroup: requestedBloodGroup,
          },
        },
        {
          $group: {
            _id: "$bloodGroup",
            total: { $sum: "$quantity" },
          },
        },
      ]);
      const totalOut = totalOutOfRequestedBloodGroup[0]?.total || 0;

      // Calculate available quantity
      const availableQuantityOfBloodGroup = totalIn - totalOut;

      // Quantity validation
      if (availableQuantityOfBloodGroup < requestedQuantityOfBlood) {
        return res.status(500).send({
          success: false,
          message: `Only ${availableQuantityOfBloodGroup}ML of ${requestedBloodGroup.toUpperCase()} is available`,
        });
      }

      // Assign hospital to the inventory record
      req.body.hospital = user?._id;
    } else {
      // If the inventoryType is "in", assign the donor to the inventory record
      req.body.donor = user?._id; // Corrected spelling of "donor"
    }

    // Save the inventory record
    const inventory = new inventoryModel(req.body);
    await inventory.save();

    return res.status(201).send({
      success: true,
      message: "New Blood Record Added",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "Error In Create Inventory API",
      error: error.message, // Return the error message for better debugging
    });
  }
};

//GET ALL BLOOD RECORDS
// const getInventoryController = async (req, res) => {
//   try {
//     const inventory = await inventoryModel
//       .find({
//         organisation: req.body.userId,
//       })
//       .populate("donar")
//       .populate("hospital")
//       .sort({ createdAt: -1 });
//     return res.status(200).send({
//       success: true,
//       message: "get all records successfully",
//       inventory,
//     });
//   } catch (error) {
//     console.log(error);
//     return res.status(500).send({
//       success: false,
//       message: "Error In Get All Inventory",
//       error,
//     });
//   }
// };
const getInventoryController = async (req, res) => {
  try {
    const { userId } = req.body; // Assuming you are passing the userId in the body

    // Check if userId exists
    if (!userId) {
      return res.status(400).send({
        success: false,
        message: "userId is required in the request body",
      });
    }

    // Fetch inventory data, populate the necessary fields, and sort by creation date
    const inventory = await inventoryModel
      .find({
        organisation: userId, // Find records by the organisation (userId)
      })
      .populate("donor") // Populate donor info when inventoryType is 'in'
      .populate("hospital") // Populate hospital info when inventoryType is 'out'
      .sort({ createdAt: -1 }); // Sort by most recent first

    return res.status(200).send({
      success: true,
      message: "Fetched all inventory records successfully",
      inventory,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "Error in fetching inventory records",
      error: error.message, // Return the error message for better debugging
    });
  }
};

//GET Hospital BLOOD RECORDS
const getInventoryHospitalController = async (req, res) => {
  try {
    const inventory = await inventoryModel
      .find(req.body.filters)
      .populate("donar")
      .populate("hospital")
      .populate("organisation")
      .sort({ createdAt: -1 });
    return res.status(200).send({
      success: true,
      message: "get hospital consumer records successfully",
      inventory,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "Error In Get consumer Inventory",
      error,
    });
  }
};

// GET BLOOD RECORDS OF 3
const getRecentInventoryController = async (req, res) => {
  try {
    const inventory = await inventoryModel
      .find({
        organisation: req.body.userId,
      })
      .limit(3)
      .sort({ createdAt: -1 });
    return res.status(200).send({
      succes: true,
      message: "recent Inventory Data",
      inventory,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "ErroeIn Recent Inventory API",
      error,
    });
  }
};

//GET DONAR RECORDS
const getDonarsController = async (req, res) => {
  try {
    const organisation = req.body.userId;
    //find donars
    const donarId = await inventoryModel.distinct("donar", {
      organisation,
    });
    //console.log(donarId);
    const donars = await userModel.find({ _id: { $in: donarId } });

    return res.status(200).send({
      success: true,
      message: "Donar Record Fetched Successfully",
      donars,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "Error in Donar records",
      error,
    });
  }
};

const getHospitalController = async (req, res) => {
  try {
    const organisation = req.body.userId;

    //GET HOSPITAL ID
    const hospitalId = await inventoryModel.distinct("hospital", {
      organisation,
    });
    //FIND HOSPITAL
    const hospitals = await userModel.find({
      _id: { $in: hospitalId },
    });
    return res.status(200).send({
      success: true,
      message: "Hospitals Data Fetched Successfully",
      hospitals,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "Error In get Hospital API",
      error,
    });
  }
};

//GET ORG PROFILES
const getOrganisationController = async (req, res) => {
  try {
    const donar = req.body.userId;
    const orgId = await inventoryModel.distinct("organisation", { donar });
    // Find all users with role "organization"
    const organisations = await userModel.find({
      _id: { $in: orgId },
    });

    return res.status(200).send({
      success: true,
      message: "Organization Users Fetched Successfully",
      organisations,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "Error In ORG API",
      error,
    });
  }
};

//GET ORG for Hospital
const getOrganisationForHospitalController = async (req, res) => {
  try {
    const hospital = req.body.userId;
    const orgId = await inventoryModel.distinct("organisation", { hospital });
    //find org
    const organisations = await userModel.find({
      _id: { $in: orgId },
    });
    return res.status(200).send({
      success: true,
      message: "Hospital Org Data Fetched Successfully",
      organisations,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "Error In Hospital ORG API",
      error,
    });
  }
};

module.exports = {
  createInventoryController,
  getInventoryController,
  getDonarsController,
  getHospitalController,
  getOrganisationController,
  getOrganisationForHospitalController,
  getInventoryHospitalController,
  getRecentInventoryController,
};
