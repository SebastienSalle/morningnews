import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import "./App.css";
import { Card, Icon, Modal } from "antd";
import Nav from "./Nav";
import { connect } from "react-redux";

const { Meta } = Card;

function ScreenArticlesBySource(props) {
  const [articleList, setArticleList] = useState([]);

  const [visible, setVisible] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  var { id } = useParams();

  useEffect(() => {
    const findArticles = async () => {
      const apiKey = "fae9860b61ba4fcbbeaae9069c65e879";
      const data = await fetch(
        `https://newsapi.org/v2/top-headlines?sources=${id}&apiKey=${apiKey}`
      );
      const body = await data.json();
      console.log(body);
      setArticleList(body.articles);
    };

    findArticles();
  }, []);

  var addToWishList = async (article) => {
    const dataraw = await fetch("/addToWishList", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `title=${article.title}&description=${article.description}&content=${article.content}&urlToImage=${article.urlToImage}&token=${props.token}&language=${props.language}`,
    });
    var data = dataraw.json();
    console.log(data);
    props.addToWishList(article);
  };

  var showModal = (title, content) => {
    setVisible(true);
    setTitle(title);
    setContent(content);
  };

  var handleOk = (e) => {
    console.log(e);
    setVisible(false);
  };

  var handleCancel = (e) => {
    console.log(e);
    setVisible(false);
  };

  return (
    <div>
      <Nav />

      <div className="Banner" />

      <div className="Card">
        {articleList.map((article, i) => (
          <div key={i} style={{ display: "flex", justifyContent: "center" }}>
            <Card
              style={{
                width: 300,
                margin: "15px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
              cover={<img alt="example" src={article.urlToImage} />}
              actions={[
                <Icon
                  type="read"
                  key="ellipsis2"
                  onClick={() => showModal(article.title, article.content)}
                />,
                <Icon
                  type="like"
                  key="ellipsis"
                  onClick={() => addToWishList(article)}
                />,
              ]}
            >
              <Meta title={article.title} description={article.description} />
            </Card>
            <Modal
              title={title}
              visible={visible}
              onOk={handleOk}
              onCancel={handleCancel}
            >
              <p>{content}</p>
            </Modal>
          </div>
        ))}
      </div>
    </div>
  );
}

function mapDispatchToProps(dispatch) {
  return {
    addToWishList: function (article) {
      dispatch({ type: "addArticle", articleLiked: article });
    },
  };
}

function mapStateToProps(state) {
  return { token: state.token, language: state.selectedLang };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ScreenArticlesBySource);
