// src/pages/About.jsx
import React from "react";

const teamMembers = [
  {
    name: "Sarah Ahmed",
    role: "Founder & CEO",
    image:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&auto=format&fit=crop&w=987&q=80",
    description: "10+ years building products people love.",
  },
  {
    name: "Omar Khalid",
    role: "CTO",
    image:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=987&q=80",
    description: "Architecture nerd. Performance freak.",
  },
  {
    name: "Ayesha Malik",
    role: "Head of Design",
    image:
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=986&q=80",
    description: "Obsessed with pixel-perfect experiences.",
  },
];

export default function About() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 pt-24 pb-32 md:pt-32 md:pb-40 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-y-0 -left-40 w-80 rotate-45 bg-white/10 blur-3xl"></div>
          <div className="absolute inset-y-0 -right-40 w-80 rotate-45 bg-white/10 blur-3xl"></div>
        </div>

        <div className="relative mx-auto max-w-7xl px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white">
            We build the future,
            <br className="hidden sm:block" />
            <span className="bg-gradient-to-r from-amber-200 to-yellow-300 bg-clip-text text-transparent">
              one line of code at a time
            </span>
          </h1>

          <p className="mt-8 text-xl md:text-2xl text-indigo-100 max-w-3xl mx-auto leading-relaxed">
            A small team of passionate people trying to make the internet
            <span className="font-semibold text-white">
              {" "}
              slightly less boring
            </span>
            .
          </p>

          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <div className="px-8 py-4 bg-white/10 backdrop-blur-md rounded-full text-white font-medium border border-white/20">
              Founded in 2023
            </div>
            <div className="px-8 py-4 bg-white/10 backdrop-blur-md rounded-full text-white font-medium border border-white/20">
              Remote-first • 12 humans
            </div>
            <div className="px-8 py-4 bg-white/10 backdrop-blur-md rounded-full text-white font-medium border border-white/20">
              Kasur → World
            </div>
          </div>
        </div>
      </div>

      {/* Mission & Values */}
      <section className="py-20 md:py-32 bg-white">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900">
              Our reason for existing
            </h2>
            <p className="mt-6 text-xl leading-8 text-gray-600">
              We believe technology should feel <strong>human</strong>, not
              corporate. We're here to create products that are{" "}
              <em>delightful</em> to use,
              <strong> fast</strong>, <strong>reliable</strong>, and{" "}
              <strong>beautiful</strong> — without making you read a 47-page
              manual.
            </p>
          </div>

          <div className="mt-20 grid gap-12 md:grid-cols-3">
            {[
              {
                title: "Simplicity",
                desc: "We fight complexity every day. If it can be explained in one sentence, it should be.",
              },
              {
                title: "Speed",
                desc: "Loading times matter. First paint under 1s is not a nice-to-have — it's the minimum.",
              },
              {
                title: "Honesty",
                desc: "No dark patterns. No fake scarcity. No bullshit metrics. We say what we mean.",
              },
            ].map((item, i) => (
              <div key={i} className="text-center">
                <div className="mx-auto w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold mb-6">
                  {i + 1}
                </div>
                <h3 className="text-2xl font-bold text-gray-900">
                  {item.title}
                </h3>
                <p className="mt-4 text-lg text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 md:py-32 bg-gray-50">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900">
              The humans behind the code
            </h2>
            <p className="mt-4 text-xl text-gray-600">
              Small team. Big dreams.
            </p>
          </div>

          <div className="mt-16 grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
            {teamMembers.map((person, i) => (
              <div
                key={i}
                className="group relative bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300"
              >
                <div className="aspect-[4/5] overflow-hidden">
                  <img
                    src={person.image}
                    alt={person.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900">
                    {person.name}
                  </h3>
                  <p className="text-indigo-600 font-medium">{person.role}</p>
                  <p className="mt-3 text-gray-600">{person.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative py-24 md:py-32 bg-gradient-to-br from-indigo-600 to-purple-700 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>

        <div className="relative mx-auto max-w-4xl px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-6xl font-bold tracking-tight">
            Want to build something
            <br />
            meaningful with us?
          </h2>
          <p className="mt-8 text-xl md:text-2xl text-indigo-100">
            We're always looking for kind, curious, and slightly obsessive
            people.
          </p>
          <div className="mt-10">
            <a
              href="mailto:careers@yourcompany.com"
              className="inline-block px-10 py-5 bg-white text-indigo-700 font-bold text-xl rounded-xl hover:bg-indigo-50 transform hover:-translate-y-1 transition-all duration-300 shadow-2xl"
            >
              Say Hello →
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
