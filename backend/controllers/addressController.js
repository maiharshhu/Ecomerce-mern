import Address from "../models/Address.js";

export const saveAddress = async (req, res) => {
    try {
        const address = await Address.create(req.body);
        res.json({ message: "Address Saved Successfully", address });
    }
    catch (error) {
        res.status(500).json({ message: "Error saving address", error });
    }
}

// get Address by userId;
export const getAddresses = async (req, res) => {
    try {
        const addresses = await Address.find({
            userId: req.params.userId
        });
        res.json({ message: "Addresses fetched successfully", addresses });
    }
    catch (error) {
        res.status(500).json({ message: "Error while fetching the address", error });
    }
}