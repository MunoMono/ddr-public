import React from "react";
import { Grid, Column, TextInput, TextArea, Button } from "@carbon/react";
import PageHero from "../components/PageHero/PageHero";

const Contact = () => {
  return (
    <div className="page footer-page">
      <PageHero
        id="contact"
        title="Contact"
        mainCols={{ lg: 8, md: 8, sm: 4 }}
      />

      <div className="page-content">
        <section className="page-section" aria-label="Contact">
          <Grid condensed>
            <Column lg={14} md={8} sm={4}>
              <form
                action="https://formspree.io/f/mpwpzzzg"
                method="POST"
              >
                <TextInput
                  id="name"
                  name="name"
                  labelText="Your Name"
                  placeholder="Jane Smith"
                  required
                  style={{ marginBottom: "1.5rem" }}
                />

                <TextInput
                  id="email"
                  name="email"
                  labelText="Your Email"
                  placeholder="jane@example.com"
                  type="email"
                  required
                  style={{ marginBottom: "1.5rem" }}
                />

                <TextArea
                  id="message"
                  name="message"
                  labelText="Your Message"
                  placeholder="Write your message here…"
                  rows={6}
                  required
                  style={{ marginBottom: "1.5rem" }}
                />

                <Button type="submit">Send Message</Button>
              </form>

              <h3 style={{ marginTop: "6rem" }}>Start a discussion on discord</h3>
              <p>
                Come and chat about the project with fellow researchers, designers and educators on the{" "}
                <a href="https://discord.gg/7nbrjGd6sv" target="_blank" rel="noopener noreferrer">discord server</a>
              </p>
            </Column>
          </Grid>
        </section>
      </div>
    </div>
  );
};

export default Contact;
