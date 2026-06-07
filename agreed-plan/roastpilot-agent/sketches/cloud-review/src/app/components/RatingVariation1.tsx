import { useState } from "react";
import { StarRating } from "./StarRating";
import { RoastCurveThumbnail } from "./RoastCurveThumbnail";
import * as Slider from "@radix-ui/react-slider";

export function RatingVariation1() {
  const [rating, setRating] = useState(0);
  const [flavorProfile, setFlavorProfile] = useState({
    aroma: 50,
    acidity: 50,
    sweetness: 50,
    body: 50,
    aftertaste: 50,
  });
  const [brewMethod, setBrewMethod] = useState<string[]>([]);
  const [note, setNote] = useState("");
  const [name, setName] = useState("");

  const brewMethods = ["Espresso", "V60", "French Press", "Moka"];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log({ rating, flavorProfile, brewMethod, note, name });
  };

  const toggleBrewMethod = (method: string) => {
    setBrewMethod((prev) =>
      prev.includes(method)
        ? prev.filter((m) => m !== method)
        : [...prev, method]
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50 pb-8">
      <form onSubmit={handleSubmit} className="max-w-md mx-auto px-6 pt-8">
        <div className="bg-white rounded-3xl shadow-lg p-6 mb-6">
          <div className="flex gap-4 mb-4">
            <div className="w-24 h-24 rounded-2xl overflow-hidden bg-amber-100 flex-shrink-0">
              <RoastCurveThumbnail />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="mb-1 truncate">Ethiopian Yirgacheffe</h1>
              <p className="text-sm text-gray-500">Roasted Jun 1, 2026</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-lg p-6 mb-6">
          <h2 className="mb-4 text-center">How would you rate this coffee?</h2>
          <div className="flex justify-center mb-2">
            <StarRating value={rating} onChange={setRating} />
          </div>
          {rating > 0 && (
            <p className="text-center text-sm text-gray-500">
              {["Poor", "Fair", "Good", "Great", "Excellent"][rating - 1]}
            </p>
          )}
        </div>

        <div className="bg-white rounded-3xl shadow-lg p-6 mb-6">
          <h3 className="mb-6">Flavor Profile</h3>
          {Object.entries(flavorProfile).map(([key, value]) => (
            <div key={key} className="mb-5 last:mb-0">
              <div className="flex justify-between mb-2">
                <label className="capitalize text-sm">{key}</label>
                <span className="text-sm text-gray-500">{value}</span>
              </div>
              <Slider.Root
                className="relative flex items-center select-none touch-none w-full h-5"
                value={[value]}
                onValueChange={([val]) =>
                  setFlavorProfile((prev) => ({ ...prev, [key]: val }))
                }
                max={100}
                step={1}
              >
                <Slider.Track className="bg-amber-100 relative grow rounded-full h-2">
                  <Slider.Range className="absolute bg-amber-500 rounded-full h-full" />
                </Slider.Track>
                <Slider.Thumb
                  className="block w-5 h-5 bg-white border-2 border-amber-500 rounded-full shadow-md hover:bg-amber-50 focus:outline-none focus:ring-2 focus:ring-amber-400"
                  aria-label={key}
                />
              </Slider.Root>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-3xl shadow-lg p-6 mb-6">
          <h3 className="mb-4">Brew Method</h3>
          <div className="grid grid-cols-2 gap-3">
            {brewMethods.map((method) => (
              <button
                key={method}
                type="button"
                onClick={() => toggleBrewMethod(method)}
                className={`py-3 px-4 rounded-xl transition-all ${
                  brewMethod.includes(method)
                    ? "bg-amber-500 text-white shadow-md"
                    : "bg-amber-50 text-gray-700 hover:bg-amber-100"
                }`}
              >
                {method}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-lg p-6 mb-6">
          <h3 className="mb-4">Tasting Notes</h3>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="What did you taste? Chocolate, berries, citrus..."
            className="w-full p-4 border border-gray-200 rounded-xl resize-none h-24 focus:outline-none focus:ring-2 focus:ring-amber-400"
          />
        </div>

        <div className="bg-white rounded-3xl shadow-lg p-6 mb-6">
          <h3 className="mb-4">Your Name (optional)</h3>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="How should we call you?"
            className="w-full p-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400"
          />
        </div>

        <button
          type="submit"
          disabled={rating === 0}
          className="w-full bg-amber-600 text-white py-4 rounded-2xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-amber-700 transition-colors active:scale-[0.98]"
        >
          Submit Rating
        </button>
      </form>
    </div>
  );
}
