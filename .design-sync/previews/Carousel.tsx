import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "kernel-portal"

const commodities = ["Corn", "Soybeans", "SRW Wheat", "Milo", "Oats"]

export function Canonical() {
  return (
    <div style={{ padding: "0 56px" }}>
      <Carousel style={{ width: 380 }}>
        <CarouselContent>
          {commodities.map((name) => (
            <CarouselItem key={name} style={{ flexBasis: "33.333%" }}>
              <div
                style={{
                  aspectRatio: "1 / 1",
                  display: "grid",
                  placeItems: "center",
                  borderRadius: 10,
                  border: "1px solid var(--border)",
                  background: "var(--muted)",
                  fontSize: 13,
                  fontWeight: 600,
                  color: "var(--primary)",
                  textAlign: "center",
                  padding: 8,
                }}
              >
                {name}
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  )
}

export function FullWidthSlides() {
  return (
    <div style={{ padding: "0 56px" }}>
      <Carousel style={{ width: 340 }}>
        <CarouselContent>
          {[
            { title: "Load #4471", detail: "Corn · 980 bu · in transit" },
            { title: "Load #4472", detail: "Soybeans · 1,020 bu · booked" },
            { title: "Load #4473", detail: "SRW wheat · 940 bu · delivered" },
          ].map((load) => (
            <CarouselItem key={load.title}>
              <div
                style={{
                  height: 120,
                  display: "grid",
                  placeItems: "center",
                  alignContent: "center",
                  gap: 6,
                  borderRadius: 10,
                  border: "1px solid var(--border)",
                  background: "var(--card)",
                }}
              >
                <div style={{ fontSize: 15, fontWeight: 600 }}>{load.title}</div>
                <div style={{ fontSize: 13, color: "var(--muted-foreground)" }}>
                  {load.detail}
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  )
}
