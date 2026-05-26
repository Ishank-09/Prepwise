import { PERSONA_NAMES } from "../../utils/constants"

const PERSONA_STYLES = {
  SWE: { color: "bg-blue-600", label: "Software Engineering" },
  DS_ML: { color: "bg-purple-600", label: "Data Science / ML" },
  PM: { color: "bg-green-600", label: "Product Management" },
  Design: { color: "bg-pink-600", label: "Design" }
}

const PersonaBadge = ({ role }) => {
  const persona = PERSONA_STYLES[role]
  const name = PERSONA_NAMES[role]

  return (
    <div className="flex items-center gap-3">
      <div className={`${persona.color} w-10 h-10 rounded-full flex items-center justify-center font-bold text-white text-lg`}>
        {name[0]}
      </div>
      <div>
        <p className="text-white font-semibold">{name}</p>
        <p className="text-gray-400 text-xs">{persona.label} Interviewer</p>
      </div>
    </div>
  )
}

export default PersonaBadge