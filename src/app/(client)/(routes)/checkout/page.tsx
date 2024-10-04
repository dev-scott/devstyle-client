"use client";
import React, { Fragment, useEffect, useState, useContext } from "react";
import {
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Box,
  Button,
  IconButton,
  useMediaQuery,
} from "@mui/material";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowBackIos,
  ArrowForwardIos,
  DeleteForeverOutlined,
} from "@mui/icons-material";
import OrderModal from "@/app/(client)/components/orderModal";
import CartContext from "@/app/(client)/contexts/cart/cartContext";
import {
  calculatePromoPrice,
  scrollToTop,
  getTotalPrice,
} from "@/app/(client)/lib/utils-script";
import "./styles.scss";

import { z } from "zod";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ErrorMessage } from "@hookform/error-message";
import myAxios from "../../lib/axios.config";
import { toast } from "react-toastify";
import { IOrderData } from "@/app/lib/interfaces";

const Checkout = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [orderData, setOrderData] = useState<IOrderData>();
  const match900 = useMediaQuery("(max-width:900px)");
  const match500 = useMediaQuery("(max-width:500px)");
  const { cartDispatch, cartContent } = useContext(CartContext);
  const createData = (
    image: JSX.Element,
    name: JSX.Element,
    collection: JSX.Element,
    color: JSX.Element,
    size: JSX.Element,
    unitPrice: JSX.Element,
    quantity: JSX.Element,
    actions: JSX.Element
  ) => {
    return {
      image,
      name,
      collection,
      color,
      size,
      unitPrice,
      quantity,
      actions,
    };
  };

  const rows = Object.values(cartContent).map((goodie, i) =>
    createData(
      <Box
        bgcolor={
          goodie.backgroundColors[
            goodie.images.findIndex(
              (image) => image.url === goodie.mainImage.url
            )
          ] ?? goodie.backgroundColors[0]
        }
        height="144px"
        width="144px"
        display="flex"
        justifyContent={"center"}
        alignItems={"center"}
      >
        <Link
          href={"/goodie/" + goodie.slug}
          style={{
            textDecoration: "none",
            height: "90%",
            width: "90%",
            position: "relative",
          }}
        >
          <Image
            src={goodie.mainImage.url}
            alt="goodie"
            fill={true}
            objectFit="contain"
          />
        </Link>
      </Box>,
      <Box style={{ fontWeight: "normal", fontFamily: "Poppins" }}>
        <Link
          href={"/goodie/" + goodie.slug}
          style={{
            textDecoration: "none",
            fontWeight: "500",
          }}
        >
          {goodie.name}
        </Link>
      </Box>,
      <Box style={{ fontWeight: "normal", fontFamily: "Poppins" }}>
        {goodie.fromCollection.title}
      </Box>,
      <Box display={"flex"} justifyContent={"center"}>
        <Box
          style={{
            boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.15)",
            background: goodie.selectedColor,
            height: "24px",
            width: "24px",
            borderRadius: "50%",
          }}
        ></Box>
      </Box>,
      <Box style={{ fontWeight: "normal", fontFamily: "Poppins" }}>
        {goodie.selectedSize}
      </Box>,
      <Typography style={{ fontWeight: "600", fontFamily: "Poppins" }}>
        {goodie.inPromo
          ? calculatePromoPrice(goodie.price, goodie.promoPercentage)
          : goodie.price}{" "}
        FCFA
      </Typography>,
      <Box
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          fontWeight: "normal",
          fontFamily: "Poppins",
        }}
      >
        <IconButton
          onClick={() =>
            cartDispatch({
              type: "UPDATE_QUANTITY",
              payload: { cartID: goodie.cartID, quantity: -1 },
            })
          }
        >
          <ArrowBackIos />
        </IconButton>
        {goodie.quantity}
        <IconButton
          onClick={() =>
            cartDispatch({
              type: "UPDATE_QUANTITY",
              payload: { cartID: goodie.cartID, quantity: +1 },
            })
          }
        >
          <ArrowForwardIos />
        </IconButton>
      </Box>,
      <Box>
        <IconButton
          onClick={() =>
            cartDispatch({ type: "DELETE_FROM_CART", payload: goodie.cartID })
          }
        >
          <DeleteForeverOutlined />
        </IconButton>
      </Box>
    )
  );

  const _devstyle = () => {
    const cartDescription = Object.values(cartContent).reduce(
      (acc, goodie, i) => {
        return (acc += `
*ID:* ${goodie._id} ;
*Name:* ${goodie.name} ;
*Link:* https://dev-style.com/goodie/${goodie.slug} ;
*Collection:* ${goodie.fromCollection.title} ;
*MainImage:* ${goodie.mainImage.url} ;
*Color:* ${goodie.selectedColor} ;
*Size:* ${goodie.selectedSize} ;
*Quantity:* ${goodie.quantity} ;
*Price:* ${goodie.price} ;
*PromoPrice:* ${
          goodie.inPromo
            ? calculatePromoPrice(goodie.price, goodie.promoPercentage)
            : "none"
        } ;
*PromoPercent:* ${goodie.inPromo ? goodie.promoPercentage : "none"} ;

------------------------------------

`);
      },
      ""
    );

    return encodeURIComponent(cartDescription);
  };

  const orderFormSchema = z.object({
    name: z.string().min(2),
    email: z.string().email().min(5),
  });

  type IOrderFormSchema = z.infer<typeof orderFormSchema>;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<IOrderFormSchema>({ resolver: zodResolver(orderFormSchema) });

  const submit = () => {};

  const propertiesToSelect = ["name", "price", "quantity", "total"];

  const goodies = Object.values(cartContent).map(
    (child: Record<string, any>) => {
      const selectedProperty: Record<string, string | number> = {};

      const total = child.price * child.quantity;

      propertiesToSelect.forEach((property) => {
        selectedProperty["total"] = total;
        if (child.hasOwnProperty(property)) {
          selectedProperty[property] = child[property];
        }
      });
      return selectedProperty;
    }
  );

  return (
    <Fragment>
      <Box
        className="checkout-wrapper"
        paddingX={match900 ? 2 : 12}
        marginX={"auto"}
        maxWidth={!match900 ? "80%" : "100%"}
      >
        <Typography
          className="title"
          style={{ fontSize: match900 ? "30px" : "40px" }}
        >
          {"< Panier />"}
        </Typography>
        <Box className="checkout-container">
          <TableContainer>
            <Table sx={{ minWidth: 850 }} aria-label="simple table">
              <TableHead>
                <TableRow>
                  <TableCell
                    align="left"
                    style={{ fontWeight: "normal", fontFamily: "Poppins" }}
                  >
                    Goodie
                  </TableCell>
                  <TableCell
                    align="center"
                    style={{ fontWeight: "normal", fontFamily: "Poppins" }}
                  >
                    Nom
                  </TableCell>
                  <TableCell
                    align="center"
                    style={{ fontWeight: "normal", fontFamily: "Poppins" }}
                  >
                    Collection
                  </TableCell>
                  <TableCell
                    align="center"
                    style={{ fontWeight: "normal", fontFamily: "Poppins" }}
                  >
                    Couleur
                  </TableCell>
                  <TableCell
                    align="center"
                    style={{ fontWeight: "normal", fontFamily: "Poppins" }}
                  >
                    Taille
                  </TableCell>
                  <TableCell
                    align="center"
                    style={{ fontWeight: "normal", fontFamily: "Poppins" }}
                  >
                    Prix unitaire
                  </TableCell>
                  <TableCell
                    align="center"
                    style={{ fontWeight: "normal", fontFamily: "Poppins" }}
                  >
                    Quantité
                  </TableCell>
                  <TableCell
                    align="right"
                    style={{ fontWeight: "normal", fontFamily: "Poppins" }}
                  >
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row, i) => (
                  <TableRow
                    key={i}
                    sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                  >
                    <TableCell
                      component="th"
                      scope="row"
                      style={{ fontWeight: "normal", fontFamily: "Poppins" }}
                    >
                      {row.image}
                    </TableCell>
                    <TableCell align="center">{row.name}</TableCell>
                    <TableCell align="center">{row.collection}</TableCell>
                    <TableCell align="center">{row.color}</TableCell>
                    <TableCell align="center">{row.size}</TableCell>
                    <TableCell align="center">{row.unitPrice}</TableCell>
                    <TableCell align="center">{row.quantity}</TableCell>
                    <TableCell align="right">{row.actions}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        <Button
          type="submit"
          className="button mx-auto "
          style={{ backgroundColor: "#220F00", color: "white" }}
          onClick={() =>
            getTotalPrice(cartContent) ? setModalOpen(true) : null
          }
        >
          Commander(
          <Image
            src={"/assets/icons/whatsapp-green.png"}
            alt="whatsapp"
            width={18}
            height={18}
          />
          )
        </Button>

        <Box
          display={"flex"}
          justifyContent="space-between"
          alignItems="center"
          marginY={1}
          marginLeft={"auto"}
        >
          <Typography style={{ fontSize: "20px", fontWeight: "500" }}>
            Total:
          </Typography>
          &nbsp; &nbsp; &nbsp;
          <Typography style={{ fontSize: "36px", fontWeight: "bold" }}>
            {getTotalPrice(cartContent) ?? 0} FCFA
          </Typography>
        </Box>
      </Box>
      <OrderModal
        goodie={goodies}
        open={modalOpen}
        handleClose={() => setModalOpen(false)}
        message={() => _devstyle()}
        // order={orderData}
      />
    </Fragment>
  );
};

export default Checkout;
