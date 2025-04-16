import { MealSection } from "./MealSection"

interface DiningHallContentProps {
  hall: {
    name: string
    sections: Array<{
      name: string
      items: Array<{
        name: string
        allergens?: string[]
        isVegetarian?: boolean
        isVegan?: boolean
      }>
    }>
  }
}

export function DiningHallContent({ hall }: DiningHallContentProps) {
  return (
    <div
      style={{
        maxWidth: 600,
        margin: "0 auto",
        padding: "0 1.25rem 2.5rem 1.25rem",
        fontFamily: "Outfit",
      }}
    >
      <div
        style={{
          fontSize: 22,
          fontWeight: 600,
          marginBottom: 16,
          marginTop: 24,
          letterSpacing: -0.5,
        }}
      >
        {hall.name}
      </div>
      {hall.sections.map((section, idx) => (
        <MealSection key={section.name + idx} section={section} />
      ))}
    </div>
  )
} 