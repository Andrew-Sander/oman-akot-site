import {
  DataTypes,
  Model,
  Optional,
  HasManyGetAssociationsMixin,
  HasManyAddAssociationMixin,
  HasManyHasAssociationMixin,
  HasManyCountAssociationsMixin,
  HasManyCreateAssociationMixin,
  Association,
} from "sequelize";
import sequelize from "../database";
import { SelectedWorks } from "./associationshit";

interface SelectedSeriesAttributes {
  id: number;
  imageUrl: string;
  name: string;
  createdAt?: Date;
  updatedAt?: Date;
}

type SelectedSeriesCreationAttributes = Optional<
  SelectedSeriesAttributes,
  "id"
>;

class SelectedSeries
  extends Model<SelectedSeriesAttributes, SelectedSeriesCreationAttributes>
  implements SelectedSeriesAttributes
{
  public id!: number;
  public imageUrl!: string;
  public name!: string;

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Association methods
  public getSelectedWorks!: HasManyGetAssociationsMixin<SelectedWorks>;
  public addSelectedWork!: HasManyAddAssociationMixin<SelectedWorks, number>;
  public hasSelectedWork!: HasManyHasAssociationMixin<SelectedWorks, number>;
  public countSelectedWorks!: HasManyCountAssociationsMixin;
  public createSelectedWork!: HasManyCreateAssociationMixin<SelectedWorks>;

  // Possible inclusion of associated works
  public readonly selectedWorks?: SelectedWorks[];

  // Association
  public static associations: {
    selectedWorks: Association<SelectedSeries, SelectedWorks>;
  };

  // Static method to define associations
  public static associate(models: any) {
    SelectedSeries.hasMany(models.SelectedWorks, {
      foreignKey: "selectedSeriesId",
      as: "selectedWorks",
    });
  }
}

SelectedSeries.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    imageUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "SelectedSeries",
    timestamps: true,
  }
);

export default SelectedSeries;
