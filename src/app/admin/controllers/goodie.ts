"use server"
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import uploadToCloudinary from "../lib/cloudinaryConfig";
import { ICloudinaryUploadResponse } from "../lib/interfaces";
import { connectToDB } from "../lib/utils";
import CollectionModel from "../models/collection";
import GoodieModel from "../models/goodie";
import SizeModel from "../models/size";

export const fetchGoodies = async (q: string, page: number) => {
  console.log("Query:", q);
  const regex = new RegExp(q, "i");

  const ITEM_PER_PAGE = 15;

  try {
    await connectToDB();

    const count = await GoodieModel.find({
      name: { $regex: regex },
    }).countDocuments();

    const goodies = await GoodieModel.find({ name: { $regex: regex } })
      .limit(ITEM_PER_PAGE)
      .skip(ITEM_PER_PAGE * (page - 1))
      .populate({
        path: 'sizes',
        model: SizeModel
      })
      .populate({
        path: 'fromCollection',
        model: CollectionModel
      })
      .sort({ createdAt: -1 })
      .lean();

    console.log("Number of goodies found:", count);
    console.log("First goodie:", goodies[0]);

    if (!goodies || goodies.length === 0) {
      console.log("No goodies found");
      return { count: 0, goodies: [] };
    }

    return { count, goodies };
  } catch (err) {
    console.error("Error fetching goodies:", err);
    if (err instanceof Error) {
      throw new Error(`Failed to fetch goodies: ${err.message}`);
    } else {
      throw new Error("Failed to fetch goodies: Unknown error");
    }
  }
};




export const addGoodie = async (formData: any) => {
  const {
    name,
    description,
    fromCollection,
    price,
    inPromo,
    promoPercentage,
    sizes,
    availableColors,
    backgroundColors,
    show,
    views,
    likes,
    mainImage,
    images,
    etsy,
  } = formData;

  console.log("Données du goodie à envoyer:", {
    name,
    description,
    fromCollection,
    price,
    inPromo,
    promoPercentage,
    sizes,
    availableColors,
    backgroundColors,
    show,
    views,
    likes,
    etsy,
  });

  try {
    await connectToDB();

    // Upload main image and additional images concurrently
    const uploadPromises = [];
    let uploadedMainImage = { public_id: "", url: "" };

    if (mainImage) {
      uploadPromises.push(
        uploader(mainImage).then((result: ICloudinaryUploadResponse) => {
          uploadedMainImage = {
            public_id: result.public_id,
            url: result.secure_url,
          };
        })
      );
    }

    const uploadedImages = [];
    if (images) {
      console.log("les image existe :", images);
      uploadPromises.push(
        ...images.map((image: any) =>
          uploader(image).then((result: ICloudinaryUploadResponse) => {
            uploadedImages.push({
              public_id: result.public_id,
              url: result.secure_url,
            });
          })
        )
      );
    }

    // Wait for all uploads to complete
    await Promise.all(uploadPromises);

    console.log("mainImageResult", uploadedMainImage);
    console.log("uploadedImages", uploadedImages);

    // Generate unique slug
    const collection = await CollectionModel.findById(fromCollection);
    if (!collection) {
      throw new Error("Collection not found");
    }
    const slug = `${collection.slug}-${name
      .toLowerCase()
      .replace(/\s+/g, "-")}`;

    const newGoodie = new GoodieModel({
      name,
      description,
      slug,
      fromCollection,
      price: Number(price),
      inPromo,
      promoPercentage: promoPercentage ? Number(promoPercentage) : undefined,
      sizes: sizes,
      availableColors: (availableColors as string)
        .split(",")
        .map((color: string) => color.trim()),
      backgroundColors: (backgroundColors as string)
        .split(",")
        .map((color: string) => color.trim()),
      show,
      views: Number(views),
      likes: Number(likes),
      mainImage: uploadedMainImage,
      images: uploadedImages,
      etsy,
    });

    await newGoodie.save();
  } catch (err) {
    console.error("Error creating goodie:", err);
    throw new Error("Failed to create goodie!");
  }

  revalidatePath("/admin/dashboard/goodies");
  redirect("/admin/dashboard/goodies");
};

const uploader = async (path: any) =>
  await uploadToCloudinary(path, `DevStyle/Goodies`, {
    transformation: [
      {
        overlay: "devstyle_watermark",
        opacity: 10,
        gravity: "north_west",
        x: 5,
        y: 5,
        width: "0.5",
      },
      {
        overlay: "devstyle_watermark",
        opacity: 6.5,
        gravity: "center",
        width: "1.0",
        angle: 45,
      },
      {
        overlay: "devstyle_watermark",
        opacity: 10,
        gravity: "south_east",
        x: 5,
        y: 5,
        width: "0.5",
      },
    ],
  });