import express from "express";
import mongoose from "mongoose";
import Userlink from "../models/userlink.js";

const router = express.Router();



// Route to get the latest valid address for a user by userId
router.get('/user/:userId/address', async (req, res) => {
    const { userId } = req.params;

    try {
        // Find the most recent userlink document where address is not "0x"
        let userLink = await Userlink.findOne({ user: userId, address: { $ne: "0x" } })
            .sort({ generateTIME: -1 });

        if (!userLink) {
            return res.status(404).json({ error: "No valid address found for this user." });
        }

        res.json({ address: userLink.address });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "An error occurred while retrieving the address." });
    }
});


router.put('/update', async (req, res) => {
    const { sessionId, address } = req.body;
  
    if (!sessionId || !address) {
      return res.status(400).send({ error: 'Session ID and address are required' });
    }
  
    try {
      const updatedUserLink = await userlink.findOneAndUpdate(
        { autolink: sessionId },
        { address },
        { new: true } // Return the updated document
      );
  
      if (!updatedUserLink) {
        return res.status(404).send({ error: 'User link not found' });
      }
  
      res.send(updatedUserLink);
    } catch (error) {
      console.error(error);
      res.status(500).send({ error: 'Failed to update user link' });
    }
  });

// GET all
router.get("/", async (req, res) => {
    try {
        const userlinks = await Userlink.find();
        res.json(userlinks);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

export default router;
