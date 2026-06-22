"""
PilgrimSafe — Synthetic Footfall Dataset Generator

Generates 2 years (2022-01-01 to 2023-12-31) of daily footfall data
for 4 Gujarat pilgrimage sites: Somnath, Dwarka, Ambaji, Pavagadh.

Output: footfall_dataset.csv (730 days × 4 temples = 2920 rows)

Rules:
  - Base footfall per temple varies
  - Weekends get ×1.8 multiplier
  - Festival days get ×3.5–6.0 multiplier
  - Rainy weather reduces footfall (×0.6)
  - Hot weather (>42°C) reduces footfall (×0.75)
  - Winter (Jan) boosts footfall (×1.3)
  - Summer (May-Jun) reduces footfall (×0.7)
  - Gaussian noise ±5–10% for realism

Usage:
  cd ml/data
  python generate_dataset.py
"""

import csv
import random
import math
from datetime import date, timedelta

# Seed for reproducibility
random.seed(42)

# ──────────────────────────────────────────────
# Configuration
# ──────────────────────────────────────────────

TEMPLES = {
    "somnath":  {"base": 8000, "peak_festival": "mahashivratri"},
    "dwarka":   {"base": 7000, "peak_festival": "janmashtami"},
    "ambaji":   {"base": 6000, "peak_festival": "navratri"},
    "pavagadh": {"base": 5000, "peak_festival": "navratri"},
}

START_DATE = date(2022, 1, 1)
END_DATE = date(2023, 12, 31)

# ──────────────────────────────────────────────
# Festival dates (approximate — festivals shift yearly based on Hindu calendar)
# ──────────────────────────────────────────────

def get_festivals(year):
    """Returns a dict mapping date → festival_name for a given year."""
    festivals = {}

    # Uttarayan / Makar Sankranti — Jan 14
    festivals[date(year, 1, 14)] = "Uttarayan"
    festivals[date(year, 1, 15)] = "Uttarayan"

    # Mahashivratri — Feb/Mar (approximate)
    if year == 2022:
        maha = date(2022, 3, 1)
    else:
        maha = date(2023, 2, 18)
    festivals[maha] = "Mahashivratri"
    festivals[maha + timedelta(days=1)] = "Mahashivratri"

    # Holi — Mar (approximate)
    if year == 2022:
        holi = date(2022, 3, 18)
    else:
        holi = date(2023, 3, 8)
    festivals[holi] = "Holi"
    festivals[holi + timedelta(days=1)] = "Holi"

    # Ram Navami — Apr (approximate)
    if year == 2022:
        ram = date(2022, 4, 10)
    else:
        ram = date(2023, 3, 30)
    festivals[ram] = "Ram Navami"

    # Janmashtami — Aug (approximate)
    if year == 2022:
        janma = date(2022, 8, 19)
    else:
        janma = date(2023, 9, 7)
    festivals[janma] = "Janmashtami"
    festivals[janma + timedelta(days=1)] = "Janmashtami"

    # Navratri — Oct (9 days, approximate)
    if year == 2022:
        nav_start = date(2022, 9, 26)
    else:
        nav_start = date(2023, 10, 15)
    for i in range(9):
        d = nav_start + timedelta(days=i)
        day_label = f"Navratri Day {i + 1}"
        if i == 8:
            day_label = "Navratri Day 9 (Maha Navami)"
        festivals[d] = day_label

    # Dussehra — day after Navratri
    festivals[nav_start + timedelta(days=9)] = "Dussehra"

    # Diwali — Oct/Nov (5 days, approximate)
    if year == 2022:
        diwali_start = date(2022, 10, 22)
    else:
        diwali_start = date(2023, 11, 10)
    diwali_names = ["Dhanteras", "Narak Chaturdashi", "Diwali", "Govardhan Puja", "Bhai Dooj"]
    for i in range(5):
        festivals[diwali_start + timedelta(days=i)] = diwali_names[i]

    return festivals


def get_weather(month):
    """
    Returns (weather_type, temperature) based on Gujarat climate patterns.
    Simplified model using monthly averages.
    """
    if month in (6, 7, 8, 9):  # Monsoon
        weather = random.choices(
            ["rainy", "cloudy", "sunny"],
            weights=[0.45, 0.35, 0.20],
            k=1
        )[0]
        temp = random.uniform(26, 34)
    elif month in (11, 12, 1, 2):  # Winter
        weather = random.choices(
            ["sunny", "cloudy"],
            weights=[0.75, 0.25],
            k=1
        )[0]
        temp = random.uniform(12, 28)
    elif month in (3, 4, 5):  # Summer / Pre-monsoon
        weather = random.choices(
            ["hot", "sunny", "cloudy"],
            weights=[0.40, 0.45, 0.15],
            k=1
        )[0]
        temp = random.uniform(32, 45)
    else:  # Oct — Post-monsoon
        weather = random.choices(
            ["sunny", "cloudy"],
            weights=[0.70, 0.30],
            k=1
        )[0]
        temp = random.uniform(25, 35)

    return weather, round(temp, 1)


def compute_footfall(temple, d, is_weekend, is_festival, festival_name, weather, temp):
    """
    Compute simulated footfall for a temple on a given day.

    Multiplier rules:
      - Weekday: ×1.0 | Weekend: ×1.8
      - Festival: ×3.5–5.0 (Navratri ×6.0 for Ambaji)
      - Rainy: ×0.6
      - Hot (>42°C): ×0.75
      - Jan (winter pilgrimage season): ×1.3
      - May-Jun (summer off-season): ×0.7
    """
    base = TEMPLES[temple]["base"]
    multiplier = 1.0

    # Weekend boost
    if is_weekend:
        multiplier *= 1.8

    # Festival boost — temple-specific peaks
    if is_festival:
        peak = TEMPLES[temple]["peak_festival"]
        if "navratri" in festival_name.lower() and temple in ("ambaji", "pavagadh"):
            # Navratri is HUGE for Ambaji and Pavagadh
            multiplier *= random.uniform(5.0, 6.5) if temple == "ambaji" else random.uniform(4.0, 5.5)
        elif "mahashivratri" in festival_name.lower() and temple == "somnath":
            multiplier *= random.uniform(4.5, 5.5)
        elif "janmashtami" in festival_name.lower() and temple == "dwarka":
            multiplier *= random.uniform(4.5, 5.5)
        elif "diwali" in festival_name.lower():
            multiplier *= random.uniform(3.5, 4.5)
        elif "uttarayan" in festival_name.lower():
            multiplier *= random.uniform(3.0, 4.0)
        else:
            multiplier *= random.uniform(3.0, 4.0)

    # Weather effects
    if weather == "rainy":
        multiplier *= 0.6
    elif weather == "hot" and temp > 42:
        multiplier *= 0.75

    # Seasonal adjustments
    month = d.month
    if month == 1:
        multiplier *= 1.3  # Winter pilgrimage season
    elif month in (5, 6):
        multiplier *= 0.7  # Summer off-season

    # Compute raw footfall
    footfall = base * multiplier

    # Add Gaussian noise (±5–10%)
    noise_pct = random.gauss(0, 0.075)  # ~7.5% std dev
    footfall *= (1 + noise_pct)

    # Ensure positive and integer
    footfall = max(500, int(round(footfall)))

    return footfall


def generate_dataset():
    """Generate the full dataset and write to CSV."""
    rows = []
    total_days = (END_DATE - START_DATE).days + 1

    for year in (2022, 2023):
        festivals = get_festivals(year)

        y_start = max(START_DATE, date(year, 1, 1))
        y_end = min(END_DATE, date(year, 12, 31))
        current = y_start

        while current <= y_end:
            day_of_week = current.weekday()  # 0=Monday
            is_weekend = 1 if day_of_week >= 5 else 0  # Sat=5, Sun=6
            month = current.month

            festival_name = festivals.get(current, "")
            is_festival = 1 if festival_name else 0

            weather, temp = get_weather(month)

            for temple in TEMPLES:
                footfall = compute_footfall(
                    temple, current, is_weekend, is_festival,
                    festival_name, weather, temp
                )
                surge_flag = 1 if footfall > 15000 else 0

                rows.append({
                    "date": current.isoformat(),
                    "temple": temple,
                    "day_of_week": day_of_week,
                    "month": month,
                    "is_weekend": is_weekend,
                    "is_festival": is_festival,
                    "festival_name": festival_name,
                    "weather": weather,
                    "temperature_c": temp,
                    "footfall": footfall,
                    "surge_flag": surge_flag,
                })

            current += timedelta(days=1)

    # Write CSV
    fieldnames = [
        "date", "temple", "day_of_week", "month", "is_weekend",
        "is_festival", "festival_name", "weather", "temperature_c",
        "footfall", "surge_flag"
    ]

    output_path = "footfall_dataset.csv"
    with open(output_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)

    # Print summary
    print(f"[OK] Dataset generated: {output_path}")
    print(f"   Total rows: {len(rows)}")
    print(f"   Date range: {START_DATE} to {END_DATE}")
    print(f"   Temples: {', '.join(TEMPLES.keys())}")
    print(f"   Surge days (>15k): {sum(1 for r in rows if r['surge_flag'] == 1)}")
    print(f"   Festival days: {sum(1 for r in rows if r['is_festival'] == 1)}")

    # Quick stats per temple
    for temple in TEMPLES:
        t_rows = [r for r in rows if r["temple"] == temple]
        avg = sum(r["footfall"] for r in t_rows) / len(t_rows)
        mx = max(r["footfall"] for r in t_rows)
        mn = min(r["footfall"] for r in t_rows)
        print(f"   {temple}: avg={avg:.0f}, min={mn}, max={mx}")


if __name__ == "__main__":
    generate_dataset()
