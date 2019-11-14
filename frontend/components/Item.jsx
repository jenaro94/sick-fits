import React, { Component } from "react";
import PropTypes from "prop-types";
import Link from "next/link";
import Title from "./styles/Title";
import ItemStyles from "./styles/ItemStyles";
import PriceTag from "./styles/PriceTag";
import formatMoney from "../lib/formatMoney";
import DeleteItem from "./DeleteItem";

export default class Item extends Component {
  static propTypes = {
    item: PropTypes.shape({
      id: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      price: PropTypes.number.isRequired,
      description: PropTypes.string.isRequired,
      image: PropTypes.string.isRequired,
      largeImage: PropTypes.string.isRequired
    })
  };

  render() {
    const { item } = this.props;
    const { id } = item;

    return (
      <ItemStyles>
        {item.image && <img src={item.image} alt={item.title} />}
        <PriceTag>{formatMoney(item.price)}</PriceTag>
        <Title>
          <Link
            href={{
              pathname: "/item",
              query: { id }
            }}
          >
            <a>{item.title}</a>
          </Link>
          <p>{item.description}</p>
          <div className="buttonList">
            <Link
              href={{
                pathname: "update",
                query: { id }
              }}
            >
              <a>Edit</a>
            </Link>
            <button>Add To Cart</button>
            <DeleteItem id={id}>Delete this item</DeleteItem>
          </div>
        </Title>
      </ItemStyles>
    );
  }
}
